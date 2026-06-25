/**
 * Wedring Matrimony — EmptyState Component
 * Premium empty states with lucide icons + named presets for every list/screen.
 *
 * Backward compatible: an emoji string `icon` still renders. Prefer the new
 * `lucideIcon` (semantic Icon name) for a tinted circular badge, or use a
 * preset: <EmptyState preset="noMatches" onAction={...} />
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';
import Button from './Button';
import Icon from './Icon';

// Named presets cover every empty/error state the app needs.
export const EMPTY_PRESETS = {
  noMatches:    { lucideIcon: 'match',   tint: colors.primary,   title: 'No matches yet', description: 'Check back soon — we refresh your matches every day.' },
  noNearby:     { lucideIcon: 'location', tint: colors.secondary, title: 'No nearby profiles', description: 'We couldn’t find profiles near you right now. Try widening your preferences.' },
  noNotifications: { lucideIcon: 'bell', tint: colors.secondary, title: 'No notifications', description: 'You’re all caught up. New activity will appear here.' },
  noContacts:   { lucideIcon: 'phone',   tint: colors.primary,   title: 'No contacts unlocked', description: 'Unlock a profile’s contact to start a conversation.' },
  noInterests:  { lucideIcon: 'heart',   tint: colors.primary,   title: 'No interests yet', description: 'Interests you send and receive will show up here.' },
  noChats:      { lucideIcon: 'chat',    tint: colors.secondary, title: 'No conversations', description: 'Your accepted matches will appear here to chat.' },
  offline:      { lucideIcon: 'offline', tint: colors.textMuted, title: 'You’re offline', description: 'Check your internet connection and try again.' },
  expired:      { lucideIcon: 'crown',   tint: colors.gold,      title: 'Membership expired', description: 'Renew your plan to keep unlocking contacts and matches.' },
  error:        { lucideIcon: 'alert',   tint: colors.error,     title: 'Something went wrong', description: 'Please try again in a moment.' },
};

const EmptyState = ({
  preset,
  icon,            // legacy emoji string
  lucideIcon,      // semantic Icon name
  tint = colors.primary,
  title,
  description = '',
  actionLabel,
  onAction,
  style,
}) => {
  const p = preset ? EMPTY_PRESETS[preset] : null;
  const resolvedLucide = lucideIcon || p?.lucideIcon;
  const resolvedTint = p?.tint || tint;
  const resolvedTitle = title || p?.title || 'Nothing here yet';
  const resolvedDesc = description || p?.description || '';

  return (
    <View style={[styles.container, style]}>
      {resolvedLucide ? (
        <View style={[styles.badge, { backgroundColor: resolvedTint + '15' }]}>
          <Icon name={resolvedLucide} size={36} color={resolvedTint} />
        </View>
      ) : (
        <Text style={styles.emoji}>{icon || '📭'}</Text>
      )}
      <Text style={styles.title}>{resolvedTitle}</Text>
      {resolvedDesc ? <Text style={styles.description}>{resolvedDesc}</Text> : null}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="small"
          fullWidth={false}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  badge: {
    width: 84, height: 84, borderRadius: 42,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: { marginTop: 20 },
});

export default React.memo(EmptyState);
