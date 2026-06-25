/**
 * Wedring Matrimony — ChatScreen Component
 * Real-time chat screen featuring database-driven messaging, pagination, and clean design.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView as SafeAreaContextView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import Avatar from '../../components/common/Avatar';
import Icon from '../../components/common/Icon';
import useAuthStore from '../../store/useAuthStore';
import * as chatApi from '../../api/chat';

const ChatScreen = ({ route, navigation }) => {
  const { chatId, otherUser } = route.params || {};
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const flatListRef = useRef(null);

  // 1. Fetch messages
  const {
    data: messages = [],
    isLoading,
    isFetchingNextPage,
  } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => chatApi.getMessages(chatId),
    enabled: !!chatId,
    staleTime: 0, // Keep fresh to allow subscription updates
  });

  // 2. Mark messages as read
  useEffect(() => {
    if (chatId && currentUser?.id) {
      chatApi.markMessagesRead(chatId, currentUser.id);
    }
  }, [chatId, currentUser?.id, messages]);

  // 3. Realtime message subscription
  useEffect(() => {
    if (!chatId) return;

    const subscription = chatApi.subscribeToMessages(chatId, (newMessage) => {
      // Append the new message to React Query's cached list
      queryClient.setQueryData(['chatMessages', chatId], (oldMessages = []) => {
        // Prevent duplicate messages in cache
        if (oldMessages.some((m) => m.id === newMessage.id)) {
          return oldMessages;
        }
        return [...oldMessages, newMessage];
      });

      // Mark as read if the current user is active and isn't the sender
      if (newMessage.sender_id !== currentUser?.id) {
        chatApi.markMessagesRead(chatId, currentUser?.id);
      }
    });

    setIsSubscribed(true);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [chatId, queryClient, currentUser?.id]);

  // 4. Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (text) => chatApi.sendMessage(chatId, currentUser.id, text),
    onSuccess: (newMessage) => {
      // Optimistically append the message
      queryClient.setQueryData(['chatMessages', chatId], (oldMessages = []) => {
        if (oldMessages.some((m) => m.id === newMessage.id)) {
          return oldMessages;
        }
        return [...oldMessages, newMessage];
      });
      // Invalidate the chat list so the last message text updates there
      queryClient.invalidateQueries({ queryKey: ['chatList', currentUser?.id] });
    },
  });

  const handleSend = () => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    setMessageText('');
    sendMessageMutation.mutate(trimmed);

    // Smooth scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderMessageItem = useCallback(({ item }) => {
    const isMe = item.sender_id === currentUser?.id;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleSent : styles.bubbleReceived,
          ]}
        >
          <Text style={isMe ? styles.textSent : styles.textReceived}>
            {item.content}
          </Text>
          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeText, isMe ? styles.timeTextSent : styles.timeTextReceived]}>
              {formatMessageTime(item.created_at)}
            </Text>
            {isMe && (
              <Text style={styles.statusIndicator}>
                {item.is_read ? ' ✓✓' : ' ✓'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  }, [currentUser?.id]);

  // Scroll to bottom on initial load and when messages change
  const handleContentSizeChange = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaContextView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="chevronLeft" size={24} color={colors.textPrimary} strokeWidth={2.2} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Avatar
            source={otherUser?.photos?.find((p) => p.is_primary)?.storage_path || null}
            name={otherUser?.display_name || 'User'}
            size="small"
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherUser?.display_name || 'Chat'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {otherUser?.city || 'Verified Member'}
            </Text>
          </View>
        </View>
      </View>

      {/* Message List */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={handleContentSizeChange}
            onLayout={handleContentSizeChange}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Icon name="arrowRight" size={20} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaContextView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  backButton: {
    paddingRight: 16,
    paddingVertical: 8,
  },
  backIcon: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    width: '100%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.lg,
  },
  bubbleSent: {
    backgroundColor: colors.chatBubbleSent,
    borderBottomRightRadius: 2,
  },
  bubbleReceived: {
    backgroundColor: colors.chatBubbleReceived,
    borderBottomLeftRadius: 2,
  },
  textSent: {
    color: colors.chatTextSent,
    fontSize: 15,
    lineHeight: 20,
  },
  textReceived: {
    color: colors.chatTextReceived,
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeText: {
    fontSize: 10,
  },
  timeTextSent: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  timeTextReceived: {
    color: colors.textSecondary,
  },
  statusIndicator: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    color: colors.textPrimary,
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendButtonText: {
    color: colors.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ChatScreen;
