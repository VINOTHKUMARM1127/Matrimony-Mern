/**
 * Wedring Matrimony — Chat List Screen
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import Avatar from '../../components/common/Avatar';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import { ChatItemSkeleton } from '../../components/common/SkeletonLoader';
import useAuthStore from '../../store/useAuthStore';
import { getChatList } from '../../api/chat';

const ChatListScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: chats, isLoading, refetch } = useQuery({
    queryKey: ['chatList', user?.id],
    queryFn: () => getChatList(user?.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000,
  });

  const handleChatPress = useCallback((chat) => {
    navigation.navigate('Chat', {
      chatId: chat.id,
      otherUser: chat.otherUser,
    });
  }, [navigation]);

  const formatTime = useCallback((dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }, []);

  const renderChatItem = useCallback(({ item }) => {
    const { otherUser } = item;
    const photo = otherUser?.photos?.find((p) => p.is_primary)?.storage_path || null;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <Avatar
          source={photo}
          name={otherUser?.display_name || ''}
          size="medium"
          showOnline
          isOnline={false}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {otherUser?.display_name || 'User'}
            </Text>
            <Text style={styles.chatTime}>{formatTime(item.last_message_at)}</Text>
          </View>
          <Text style={styles.chatMessage} numberOfLines={1}>
            {item.last_message_text || 'Start a conversation'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleChatPress, formatTime]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Messages"
        subtitle={chats?.length ? `${chats.length} conversation${chats.length > 1 ? 's' : ''}` : 'Your matches will appear here'}
      />

      <FlatList
        data={chats || []}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {[1, 2, 3, 4, 5].map((i) => <ChatItemSkeleton key={i} />)}
            </View>
          ) : (
            <EmptyState
              preset="noChats"
              actionLabel="Browse Profiles"
              onAction={() => navigation.navigate('HomeTab')}
            />
          )
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingTop: 4, flexGrow: 1 },
  chatItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal, paddingVertical: 14,
  },
  chatInfo: { flex: 1, marginLeft: 14 },
  chatHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  chatName: { fontSize: 15.5, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  chatTime: { fontSize: 12, color: colors.textMuted, marginLeft: 8, fontWeight: '500' },
  chatMessage: { fontSize: 13.5, color: colors.textSecondary, marginTop: 3 },
  separator: { height: 1, backgroundColor: colors.borderLight, marginLeft: 78 },
});

export default ChatListScreen;
