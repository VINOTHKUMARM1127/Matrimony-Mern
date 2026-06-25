/**
 * Wedring Matrimony — Settings API
 * Fetch configurations, user limits, and plans
 */
import apiClient from './apiClient';

/**
 * Fetch Admin Settings (Read-only for mobile client)
 */
export const fetchAdminSettings = async () => {
  // Mobile app doesn't need admin settings directly anymore,
  // but keeping interface to avoid breaking components.
  return {};
};

/**
 * Fetch user limits / credit balances
 */
export const fetchUserLimits = async (userId) => {
  if (!userId) return null;
  try {
    const balance = await apiClient.get('/credits/balance');
    return {
      contacts_limit: balance.contact_credits,
      interests_limit: balance.interest_credits,
      // Provide fallback values for old properties if needed
      initial_recommended_profiles: 0,
      daily_recommended_increment: 0,
    };
  } catch (err) {
    return null;
  }
};

/**
 * Fetch purchasable premium plans from backend.
 */
export const fetchPremiumPlans = async () => {
  try {
    const plans = await apiClient.get('/membership/plans');
    
    return (plans || [])
      .filter(d => d.name !== 'free') // Don't show Free in premium screen
      .map((d) => {
        const planName = (d.name || d.tier || '').toLowerCase();
        const validityDays = d.validity_days || 30;
        const durationMonths = Math.max(1, Math.round(validityDays / 30));
        
        let color = '#D4AF37'; // Default Gold
        let popular = false;
        
        if (planName.includes('silver')) {
          color = '#C0C0C0';
        } else if (planName.includes('gold')) {
          color = '#D4AF37';
          popular = true;
        } else if (planName.includes('platinum') || planName.includes('diamond')) {
          color = '#E5E4E2';
        }

        let features = [
          `${d.contact_credits} Contact Credits`,
          `${d.interest_credits} Interest Credits`,
          `Valid for ${validityDays} Days`,
        ];

        return {
          id: d.id,
          tier: d.name,
          name: d.name,
          price: d.price,
          durationMonths,
          duration: `${validityDays} Days`,
          validityDays,
          features,
          color,
          popular,
          contactsLimit: d.contact_credits,
          interestsLimit: d.interest_credits,
        };
      });
  } catch (err) {
    console.error('Error fetching premium plans:', err);
    return [];
  }
};
