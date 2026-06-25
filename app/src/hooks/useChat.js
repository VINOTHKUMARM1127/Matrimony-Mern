/**
 * Wedring Matrimony — useChat Hook
 * Subscribes to realtime chat updates, manages active chats, and tracks messages
 */
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '../api/chat';
import useAuthStore from '../store/useAuthStore';

export const useChat = (chatId) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [realtimeMessages, setRealtimeMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Chat List Query
  const {
    data: chatList,
    isLoading: loadingChatList,
    refetch: refetchChatList,
  } = useQuery({
    queryKey: ['chatList', user?.id],
    queryFn: () => chatApi.getChatList(user?.id),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds stale
  });

  // Messages Query
  const {
    data: initialMessages,
    isLoading: loadingMessages,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatApi.getMessages(chatId),
    enabled: !!chatId,
  });

  // Reset realtime messages when chatId changes
  useEffect(() => {
    setRealtimeMessages([]);
  }, [chatId]);

  // Combine query messages with realtime additions
  const messages = [
    ...(initialMessages || []),
    ...realtimeMessages.filter(
      (rm) => !(initialMessages || []).some((im) => im.id === rm.id)
    ),
  ];

  // Subscribe to realtime changes (Mocked/Disabled without backend WebSocket)
  useEffect(() => {
    if (!chatId) return;

    // Mark messages read on open
    chatApi.markMessagesRead(chatId, user?.id);

    // Polling fallback could be implemented here using setInterval and refetchMessages()
    // const interval = setInterval(() => refetchMessages(), 5000);
    // return () => clearInterval(interval);
    
    return () => {};
  }, [chatId, queryClient, user?.id]);

  // Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: ({ content, messageType }) =>
      chatApi.sendMessage(chatId, user?.id, content, messageType),
    onSuccess: (newMsg) => {
      setRealtimeMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      queryClient.invalidateQueries({ queryKey: ['chatList', user?.id] });
    },
  });

  // Track Presence & Typing status
  const broadcastTyping = useCallback((typingState) => {
    if (!chatId) return;
    // Broadcast disabled without backend
  }, [chatId, user?.id]);

  // Listen for active chat typing indicator
  useEffect(() => {
    if (!chatId) return;
    // Listener disabled without backend
    return () => {};
  }, [chatId, user?.id]);

  return {
    chatList,
    loadingChatList,
    refetchChatList,
    messages,
    loadingMessages,
    refetchMessages,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    broadcastTyping,
    partnerIsTyping: isTyping,
  };
};

export default useChat;
