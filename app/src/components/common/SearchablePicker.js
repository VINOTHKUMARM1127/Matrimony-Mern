/**
 * Wedring Matrimony — SearchablePicker Component
 * Reusable high-performance searchable option picker with modal & FlatList
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, borderRadius, layout } from '../../theme';

const SearchablePicker = ({
  label,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  options = [],
  value,
  onChange,
  multiple = false,
  required = false,
  error,
  style,
  triggerStyle,
  noPreferenceValue = 'Caste No Bar', // special value that clears others when selected
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Map values to labels for easier display
  const optionsMap = useMemo(() => {
    const map = new Map();
    options.forEach((opt) => {
      const optVal = typeof opt === 'object' ? opt.value : opt;
      const optLabel = typeof opt === 'object' ? opt.label : opt;
      map.set(optVal, optLabel);
    });
    return map;
  }, [options]);

  // Display text for currently selected value(s)
  const displayText = useMemo(() => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.length === 0) return placeholder;
      return currentValues.map((v) => optionsMap.get(v) || v).join(', ');
    } else {
      if (!value) return placeholder;
      return optionsMap.get(value) || value;
    }
  }, [value, multiple, placeholder, optionsMap]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return options;
    return options.filter((opt) => {
      const optLabel = typeof opt === 'object' ? opt.label : opt;
      const optVal = typeof opt === 'object' ? opt.value : opt;
      return (
        String(optLabel).toLowerCase().includes(query) ||
        String(optVal).toLowerCase().includes(query)
      );
    });
  }, [options, searchQuery]);

  // Check if option is selected
  const isSelected = useCallback(
    (optionValue) => {
      if (multiple) {
        return Array.isArray(value) && value.includes(optionValue);
      }
      return value === optionValue;
    },
    [value, multiple]
  );

  // Handle option select
  const handleSelect = useCallback(
    (optionValue) => {
      if (multiple) {
        const currentValues = Array.isArray(value) ? value : [];
        let newValues;

        if (optionValue === noPreferenceValue) {
          // If "No Preference" selected, clear all other selections and select ONLY this
          newValues = currentValues.includes(noPreferenceValue) ? [] : [noPreferenceValue];
        } else {
          // If a specific option is selected, remove "No Preference" from selection and toggle this option
          const withoutNoPreference = currentValues.filter((v) => v !== noPreferenceValue);
          newValues = withoutNoPreference.includes(optionValue)
            ? withoutNoPreference.filter((v) => v !== optionValue)
            : [...withoutNoPreference, optionValue];
        }
        onChange(newValues);
      } else {
        onChange(value === optionValue ? '' : optionValue);
        setModalVisible(false);
        setSearchQuery('');
      }
    },
    [value, onChange, multiple, noPreferenceValue]
  );

  // Render list item
  const renderItem = useCallback(
    ({ item }) => {
      const optionValue = typeof item === 'object' ? item.value : item;
      const optionLabel = typeof item === 'object' ? item.label : item;
      const selected = isSelected(optionValue);

      return (
        <TouchableOpacity
          style={[styles.itemRow, selected && styles.itemRowSelected]}
          onPress={() => handleSelect(optionValue)}
          activeOpacity={0.7}
        >
          <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
            {optionLabel}
          </Text>
          {multiple && (
            <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [isSelected, multiple, handleSelect]
  );

  const handleOpen = () => {
    setModalVisible(true);
    setSearchQuery('');
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
          {multiple && <Text style={styles.hint}>(Select multiple)</Text>}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.trigger,
          error && styles.triggerError,
          triggerStyle,
        ]}
        onPress={handleOpen}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.triggerText,
            (!value || (multiple && value.length === 0)) && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {displayText}
        </Text>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{label || 'Select'}</Text>
              {multiple ? (
                <TouchableOpacity onPress={handleClose} style={styles.doneBtn}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.emptyHeaderPlaceholder} />
              )}
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                clearButtonMode="while-editing"
                autoCorrect={false}
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchBtn}
                >
                  <Text style={styles.clearSearchTxt}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Options List */}
            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => (typeof item === 'object' ? item.value : item)}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No matches found</Text>
                </View>
              }
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  labelError: {
    color: colors.error,
  },
  required: {
    color: colors.error,
    marginLeft: 2,
    fontSize: 14,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    minHeight: layout.inputHeight,
    paddingHorizontal: 16,
  },
  triggerError: {
    borderColor: colors.error,
  },
  triggerText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 8,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  closeBtnText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingLeft: 12,
  },
  doneBtnText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
  },
  emptyHeaderPlaceholder: {
    width: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 24,
  },
  clearSearchTxt: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemRowSelected: {
    backgroundColor: colors.primarySurface,
  },
  itemText: {
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 12,
  },
  itemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});

export default SearchablePicker;
