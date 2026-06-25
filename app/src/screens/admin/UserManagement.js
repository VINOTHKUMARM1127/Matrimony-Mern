/**
 * Wedring Matrimony — UserManagement Screen
 * Search and manage user profiles, including verification and suspension controls
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';
import apiClient from '../../api/apiClient';
import Button from '../../components/common/Button';

const UserManagement = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  // Fetch all users list
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const data = await apiClient.get('/admin/users');
      return data || [];
    },
  });

  // Verify User Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ userId, isVerified }) => {
      await apiClient.put(`/admin/users/${userId}`, { is_verified: isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      Alert.alert('Success', 'User verification state updated!');
    },
  });

  const filteredUsers = users?.filter(u => 
    u.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.profile_id?.toLowerCase().includes(search.toLowerCase()) ||
    u.city?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleVerifyToggle = (user) => {
    Alert.alert(
      user.is_verified ? 'Unverify User' : 'Verify User',
      `Are you sure you want to change verification for ${user.display_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed', 
          onPress: () => verifyMutation.mutate({ userId: user.id, isVerified: !user.is_verified }) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Management</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, ID, city..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {/* User list */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userMeta}>
              <Text style={styles.name}>{item.display_name}</Text>
              <Text style={styles.id}>ID: {item.profile_id || 'N/A'}</Text>
              <Text style={styles.info}>
                {item.gender} • {item.religion} • {item.city || 'Tamil Nadu'}
              </Text>
            </View>
            <View style={styles.actions}>
              <Button
                title={item.is_verified ? '✓ Verified' : 'Verify'}
                variant={item.is_verified ? 'success' : 'outline'}
                onPress={() => handleVerifyToggle(item)}
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    paddingRight: 16,
  },
  backText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  searchBar: {
    padding: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 12,
    height: 40,
    color: colors.text,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  userMeta: {
    flex: 1,
    paddingRight: 16,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  id: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  info: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  actions: {
    justifyContent: 'center',
  },
  actionBtn: {
    minWidth: 90,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
  },
});

export default UserManagement;
