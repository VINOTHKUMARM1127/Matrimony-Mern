/**
 * Wedring Matrimony — PlanCard Component
 * Displays a premium plan subscription card with features list and purchase trigger
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import Button from '../common/Button';

const PlanCard = ({ plan, onSelect, isPopular = false }) => {
  if (!plan) return null;

  return (
    <View style={[
      styles.card,
      isPopular ? styles.popularCard : styles.regularCard
    ]}>
      {isPopular && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>POPULAR</Text>
        </View>
      )}

      {/* Plan Header */}
      <Text style={styles.name}>{plan.name}</Text>
      
      <View style={styles.priceRow}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.duration}> / {plan.duration}</Text>
      </View>

      <Text style={styles.tagline}>{plan.tagline}</Text>

      {/* Feature List */}
      <View style={styles.features}>
        {plan.features.map((feature, idx) => (
          <View key={idx} style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Action CTA */}
      <Button
        title="Upgrade Now"
        onPress={() => onSelect(plan)}
        variant={isPopular ? 'primary' : 'outline'}
        style={styles.cta}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    padding: 20,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    position: 'relative',
    marginVertical: 8,
  },
  popularCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  regularCard: {
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 12,
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
  },
  duration: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    fontWeight: '500',
  },
  features: {
    gap: 10,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheck: {
    color: colors.success,
    fontWeight: '700',
    marginRight: 8,
    fontSize: 14,
  },
  featureText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  cta: {
    marginTop: 'auto',
  },
});

export default PlanCard;
