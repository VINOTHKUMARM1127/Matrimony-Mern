/**
 * Wedring Matrimony — Razorpay Payment Service
 */
import { RAZORPAY_KEY_ID, APP_NAME } from '../utils/constants';

/**
 * Create Razorpay order via Supabase Edge Function
 */
export const createRazorpayOrder = async (planType, amount, userId) => {
  const keyId = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are missing from environment variables');
  }

  const encodedAuth = btoa(`${keyId}:${keySecret}`);

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedAuth}`,
    },
    body: JSON.stringify({
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `rcpt_${userId}_${Date.now()}`.substring(0, 40),
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Razorpay API Error: ${errorData}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Open Razorpay checkout
 * NOTE: Requires react-native-razorpay native module
 * Only works in development builds (not Expo Go)
 */
export const openCheckout = async (options) => {
  try {
    // Dynamic import to avoid crash if module not available
    const RazorpayCheckout = require('react-native-razorpay').default;

    const defaultOptions = {
      key: RAZORPAY_KEY_ID,
      name: APP_NAME,
      currency: 'INR',
      theme: { color: '#FF6B35' },
      ...options,
    };

    const data = await RazorpayCheckout.open(defaultOptions);
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Verify payment signature (bypassed for client-side dev mock)
 */
export const verifyPayment = async (paymentData) => {
  // In a real app, you MUST verify the Razorpay signature on a secure server.
  // For this local client-side implementation, we trust the checkout response.
  return { success: true, mock_verification: true };
};

export default {
  createRazorpayOrder,
  openCheckout,
  verifyPayment,
};
