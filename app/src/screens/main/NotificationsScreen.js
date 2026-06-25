/**
 * Wedring Matrimony — Notifications Screen
 * Premium notification list: tinted lucide icon badges per type, unread accent,
 * grouped card rows, "Mark all read" action.
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../theme';
import { borderRadius, layout } from '../../theme/spacing';
import shadows from '../../theme/shadows';
import Icon from '../../components/common/Icon';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import useAuthStore from '../../store/useAuthStore';
import { useNotifications } from '../../hooks/useNotifications';

// type -> { lucide icon name, tint color }
const TYPE_META = {
  new_interest:      { icon: 'heart',    tint: colors.primary },
  interest_accepted: { icon: 'sparkles', tint: colors.success },
  new_message:       { icon: 'chat',     tint: colors.secondary },
  profile_view:      { icon: 'eye',      tint: colors.secondary },
  daily_match:       { icon: 'star',     tint: colors.gold },
  premium_expiry:    { icon: 'crown',    tint: colors.gold },
  system:           { icon: 'bell',     tint: colors.textMuted },
};
const metaFor = (type) => TYPE_META[type] || { icon: 'bell', tint: colors.primary };

const NotificationsScreen = ({ navigation }) => {
  const user = useAuthStore((s) => s.user);

  const { notifications, isLoading, refetch, markAllRead, markAsRead, unreadCount } = useNotifications();

  const formatTime = useCallback((dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${days}d ago`;
  }, []);



  const renderItem = useCallback(({ item, index }) => {
    const meta = metaFor(item.type);
    return (
      <Animated.View entering={FadeInDown.duration(260).delay(Math.min(index, 8) * 45)}>
        <TouchableOpacity
          style={[styles.item, !item.is_read && styles.itemUnread]}
          activeOpacity={0.75}
          onPress={async () => {
            if (!item.is_read) {
              await markAsRead(item.id);
            }
          }}
        >
          <View style={[styles.iconBadge, { backgroundColor: meta.tint + '18' }]}>
            <Icon name={meta.icon} size={20} color={meta.tint} strokeWidth={2.2} />
          </View>
          <View style={styles.content}>
            <Text style={[styles.title, !item.is_read && styles.titleUnread]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
          {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  }, [formatTime, refetch]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} new update${unreadCount > 1 ? 's' : ''}` : 'You’re all caught up'}
        rightIcon={unreadCount > 0 ? 'checkAll' : undefined}
        onRightPress={markAllRead}
      />
      <FlatList
        data={notifications || []}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading ? <EmptyState preset="noNotifications" /> : null}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: layout.screenPaddingHorizontal, paddingTop: 8, paddingBottom: 32, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardSoft,
  },
  itemUnread: {
    backgroundColor: colors.primarySurface,
    borderColor: colors.primaryMuted,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  titleUnread: { fontWeight: '800' },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 6, fontWeight: '500' },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, marginTop: 6, marginLeft: 6 },
  separator: { height: 12 },
});

export default NotificationsScreen;
