/**
 * Wedring Matrimony — useAuth Hook
 * React hook interface for useAuthStore global state
 */
import { useCallback } from 'react';
import useAuthStore from '../store/useAuthStore';

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isOtpSent = useAuthStore((s) => s.isOtpSent);
  const error = useAuthStore((s) => s.error);
  
  const sendOTP = useAuthStore((s) => s.sendOTP);
  const verifyOTP = useAuthStore((s) => s.verifyOTP);
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signUpWithEmail = useAuthStore((s) => s.signUpWithEmail);
  const signOut = useAuthStore((s) => s.signOut);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const clearError = useAuthStore((s) => s.clearError);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isOtpSent,
    error,
    sendOTP,
    verifyOTP,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    resetPassword,
    clearError,
  };
};

export default useAuth;
