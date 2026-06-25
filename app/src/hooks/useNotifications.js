/**
 * Wedring Matrimony — useNotifications Hook
 * Registers for push notifications, handles incoming payloads, and queries DB list
 */
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notifService from '../services/notifications';
import useAuthStore from '../store/useAuthStore';
import apiClient from '../api/apiClient';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  // Load notifications from DB
  const {
    data: notifications,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      try {
        const data = await apiClient.get('/notifications');
        return data || [];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!user?.id,
  });

  // Mark single notification read
  const markReadMutation = useMutation({
    mutationFn: async (notifId) => {
      await apiClient.put(`/notifications/${notifId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Mark all read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Setup push token on mount if authenticated
  useEffect(() => {
    if (!user?.id) return;

    const setupPush = async () => {
      const token = await notifService.registerForPushNotifications();
      if (token) {
        await notifService.savePushToken(user.id, token);
      }
    };

    setupPush();
  }, [user?.id]);

  // Foreground notification handler
  useEffect(() => {
    const recvListener = notifService.addNotificationReceivedListener((notification) => {
      // Invalidate query to update list in UI
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    });

    const respListener = notifService.addNotificationResponseListener((response) => {
      // Handle notification tap / routing
      const data = response.notification.request.content.data;
      console.log('Notification tapped data:', data);
    });

    return () => {
      recvListener.remove();
      respListener.remove();
    };
  }, [queryClient, user?.id]);

  return {
    notifications,
    isLoading,
    refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    unreadCount: notifications?.filter((n) => !n.is_read).length || 0,
  };
};

export default useNotifications;
