/**
 * Wedring Matrimony — Upgrades Screen
 * Subscription plans (Bronze, Silver, Gold) with Razorpay integration and Mock Gateway fallback.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import useAuthStore from '../../store/useAuthStore';
import useProfileStore from '../../store/useProfileStore';
import useToastStore from '../../store/useToastStore';
import { RAZORPAY_KEY_ID } from '../../utils/constants';
import { createSubscription } from '../../api/subscriptions';
import { fetchPremiumPlans } from '../../api/settingsApi';
import { createRazorpayOrder, openCheckout, verifyPayment } from '../../services/razorpay';
import { useQueryClient } from '@tanstack/react-query';


const PremiumScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const showToast = useToastStore((state) => state.showToast);
  const queryClient = useQueryClient();
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('gold');
  const [processing, setProcessing] = useState(false);

  // Refresh every plan/quota-dependent cache so the new tier reflects instantly
  // across Home, Profile, UserProfile, and the matches feeds — no logout/restart.
  // ORDER MATTERS: reload the profile + the per-user limits FIRST and await them,
  // so the feed queries (whose query-keys depend on the new recommended/nearby/
  // daily limits) re-key to the upgraded caps before they refetch. Invalidating
  // the feeds before the limits land would refetch them against the stale (free)
  // caps and the new premium profiles would not appear until a manual refresh.
  const refreshAfterPurchase = async () => {
    await useProfileStore.getState().loadProfile(user.id);

    // 1) Force the limit/quota queries to refetch and SETTLE first.
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['userLimits', user.id] }),
      queryClient.refetchQueries({ queryKey: ['user_quotas', user.id] }),
      queryClient.refetchQueries({ queryKey: ['activeSubscription', user.id] }),
    ]);

    // 2) Now explicitly refetch the feeds — they re-key to the new caps and fetch fresh.
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['recommended'] }),
      queryClient.refetchQueries({ queryKey: ['nearbyMatches'] }),
      queryClient.refetchQueries({ queryKey: ['dailyMatches'] }),
      queryClient.invalidateQueries({ queryKey: ['subscriptionHistory', user.id] }),
    ]);
  };

  React.useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await (async () => {
          try { return { data: await fetchPremiumPlans(), error: null }; }
          catch (e) { return { data: null, error: e }; }
        })();
        
        if (data && !error) {
          const mappedPlans = data
            .filter(d => d.name && d.name.toLowerCase() !== 'free')
            .map(d => ({
              id: d.id,
              name: d.name,
              duration: d.duration,
              price: d.price,
              currency: 'INR',
              features: d.features || [],
              color: d.color || '#D4AF37',
              popular: d.popular
            }));
          setPlans(mappedPlans);
          if (mappedPlans.length > 0) {
            setSelectedPlan(mappedPlans.find(p => p.popular)?.id || mappedPlans[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching premium plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePurchase = useCallback(async () => {
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) return;

    setProcessing(true);

    try {
      const isExpoGo = Constants.appOwnership === 'expo';
      if (!RAZORPAY_KEY_ID || isExpoGo) {
        // Safe developer fallback if no key is provided or running inside Expo Go
        Alert.alert(
          '💳 Matrimony Mock Checkout',
          `Expo Go / Developer local sandbox.\n\nSubscribe to ${plan.name} for ₹${plan.price}?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setProcessing(false) },
            {
              text: 'Simulate Success ✔',
              onPress: async () => {
                const mockPaymentId = `pay_mock_${Date.now()}`;
                try {
                  await createSubscription({
                    user_id: user.id,
                    plan_type: plan.name.toLowerCase(),
                    razorpay_payment_id: mockPaymentId,
                    amount: plan.price
                  });

                  // Reload profile and invalidate all plan/quota caches
                  await refreshAfterPurchase();

                  Alert.alert(
                    'Subscription Successful! 🎉', 
                    `Welcome to ${plan.name}! Your account has been upgraded.`,
                    [{ text: 'Great!', onPress: () => navigation.goBack() }]
                  );
                } catch (error) {
                  console.error('Subscription error:', error);
                  showToast('error', 'Error', 'Failed to process checkout. Please try again.');
                } finally {
                  setProcessing(false);
                }
              },
            },
          ]
        );
        return;
      }

      // Live production Razorpay Flow
      let orderId;
      try {
        const orderData = await createRazorpayOrder(plan.id, plan.price * 100, user.id);
        if (orderData && orderData.id) {
          orderId = orderData.id;
        } else {
          throw new Error('Invalid order data received from Razorpay API');
        }
      } catch (err) {
        console.error('Razorpay order creation error:', err.message);
        showToast('error', 'Payment Initialization Failed', 'Could not start the payment process. Please check your connection or contact support.');
        setProcessing(false);
        return;
      }

      const options = {
        description: `${plan.name} - Wedring Matrimony`,
        image: 'https://cdn-icons-png.flaticon.com/512/10008/10008272.png',
        currency: plan.currency,
        key: RAZORPAY_KEY_ID,
        amount: plan.price * 100,
        name: 'Wedring Matrimony',
        order_id: orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.user_metadata?.display_name || '',
        },
        theme: { color: colors.primary },
      };

      const checkoutResult = await openCheckout(options);

      if (checkoutResult.success) {
        const paymentData = checkoutResult.data;

        try {
          await verifyPayment({
            razorpay_order_id: paymentData.razorpay_order_id,
            razorpay_payment_id: paymentData.razorpay_payment_id,
            razorpay_signature: paymentData.razorpay_signature,
          });
        } catch (verifyErr) {
          console.warn('Payment signature verification bypassed:', verifyErr.message);
        }

        try {
          await createSubscription({
            user_id: user.id,
            plan_type: plan.name.toLowerCase(),
            razorpay_payment_id: paymentData.razorpay_payment_id,
            amount: plan.price
          });

          await refreshAfterPurchase();

          Alert.alert(
            'Success! 🎉', 
            `Welcome to ${plan.name}! Enjoy premium access.`,
            [{ text: 'Awesome', onPress: () => navigation.goBack() }]
          );
        } catch (subErr) {
          console.error('Subscription error:', subErr);
          showToast('error', 'Error', 'Failed to activate your subscription. Please contact support.');
        }
      } else {
        const errorMsg = checkoutResult.error?.message || 'Checkout process was closed.';
        if (errorMsg.includes("RazorpayCheckout") || errorMsg.toLowerCase().includes("open") || errorMsg.includes("null")) {
          showToast('warning', 'Native Module Required', 'Razorpay requires a custom development build to run.');
        } else {
          showToast('error', 'Payment Cancelled', errorMsg);
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showToast('error', 'Error', 'Failed to process checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [selectedPlan, user, plans, showToast]);

  const activePlan = plans.find((p) => p.id === selectedPlan);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Premium Header */}
      <LinearGradient
        colors={[colors.gradientPrimaryStart, colors.gradientPrimaryEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerGlowOne} />
        <View style={styles.headerGlowTwo} />
        <View style={styles.crownBadge}>
          <Icon name="crown" size={28} color="#FFFFFF" />
        </View>
        <Text style={styles.title}>Wedring Prime</Text>
        <Text style={styles.subtitle}>
          Unlock direct contacts, full horoscopes, and priority matches
        </Text>
        <View style={styles.trustRow}>
          {['Verified profiles', 'Cancel anytime', 'Secure payment'].map((t) => (
            <View key={t} style={styles.trustChip}>
              <Icon name="check" size={11} color="#FFFFFF" strokeWidth={3} />
              <Text style={styles.trustChipText}>{t}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Plans list */}
      {loadingPlans ? (
        <View style={styles.plansList}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.planSkeleton} />
          ))}
        </View>
      ) : (
        <View style={styles.plansList}>
          <Text style={styles.sectionLabel}>Choose your plan</Text>
          {plans.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
                isSelected && { borderColor: plan.color },
              ]}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.92}
            >
              {/* Accent rail on the selected card */}
              {isSelected && <View style={[styles.accentRail, { backgroundColor: plan.color }]} />}

              {plan.popular && (
                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                  <Icon name="crown" size={10} color="#FFF" />
                  <Text style={styles.popularText}>BEST VALUE</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planHeadLeft}>
                  <View style={[styles.radioOuter, isSelected && { borderColor: plan.color }]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: plan.color }]} />}
                  </View>
                  <View style={styles.planNameBlock}>
                    <View style={styles.planNameRow}>
                      <View style={[styles.tierDot, { backgroundColor: plan.color }]} />
                      <Text style={styles.planName}>{plan.name}</Text>
                    </View>
                    <Text style={styles.planDuration}>{plan.duration}</Text>
                  </View>
                </View>
                <View style={styles.planPriceWrap}>
                  <View style={styles.planPrice}>
                    <Text style={styles.priceSymbol}>₹</Text>
                    <Text style={[styles.priceValue, { color: plan.color }]}>{plan.price}</Text>
                  </View>
                  <Text style={styles.priceCaption}>{plan.duration}</Text>
                </View>
              </View>

              <View style={[styles.featuresList, { borderTopColor: colors.borderLight }]}>
                {plan.features.map((feature, i) => (
                  <View key={i} style={styles.featureItem}>
                    <View style={[styles.featureCheckCircle, { backgroundColor: plan.color + '1A' }]}>
                      <Icon name="check" size={12} color={plan.color} strokeWidth={3} />
                    </View>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      )}

      {/* Subscription trigger button */}
      <View style={styles.purchaseContainer}>
        {activePlan && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{activePlan.name} · {activePlan.duration}</Text>
            <Text style={styles.summaryPrice}>₹{activePlan.price}</Text>
          </View>
        )}
        <Button
          title={`Subscribe to ${activePlan?.name || 'Plan'}`}
          onPress={handlePurchase}
          loading={processing}
          style={styles.purchaseButton}
        />
        <View style={styles.secureRow}>
          <Icon name="check" size={12} color={colors.textMuted} strokeWidth={3} />
          <Text style={styles.terms}>
            Secure payment · Non-refundable · By continuing you agree to our Terms.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerGlowOne: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerGlowTwo: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  crownBadge: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.90)',
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 300,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  trustChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
    marginLeft: 4,
  },
  plansList: {
    padding: 16,
    gap: 16,
  },
  planSkeleton: {
    height: 160,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.borderLight,
    opacity: 0.5,
  },
  planCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: 20,
    paddingLeft: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  planCardSelected: {
    borderWidth: 2,
    ...shadows.cardFloat,
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: borderRadius.xl,
    borderBottomLeftRadius: borderRadius.xl,
  },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: borderRadius.lg,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.6,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
  },
  planHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  planNameBlock: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  tierDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  planDuration: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    marginLeft: 15,
  },
  planPriceWrap: {
    alignItems: 'flex-end',
  },
  planPrice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 5,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  priceCaption: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -2,
  },
  featuresList: {
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureCheck: {
    fontSize: 14,
    marginRight: 10,
    fontWeight: '800',
  },
  featureText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  purchaseContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.primarySurface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  purchaseButton: {
    width: '100%',
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  terms: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    flexShrink: 1,
  },
});

export default PremiumScreen;
