/**
 * Wedring Matrimony — OptionSelector Component
 * Reusable option picker for registration forms (single/multi select)
 */
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme';
import { borderRadius } from '../../theme/spacing';

const OptionSelector = ({
  label,
  options = [],
  value,
  onChange,
  multiple = false,
  columns = 2,
  required = false,
  error,
  style,
}) => {
  const handleSelect = useCallback((optionValue) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(value === optionValue ? '' : optionValue);
    }
  }, [value, onChange, multiple]);

  const isSelected = useCallback((optionValue) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  }, [value, multiple]);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
          {multiple && <Text style={styles.hint}>(Select multiple)</Text>}
        </View>
      )}

      <View style={[styles.optionsGrid, { flexWrap: 'wrap' }]}>
        {options.map((option) => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          const selected = isSelected(optionValue);

          return (
            <TouchableOpacity
              key={optionValue}
              onPress={() => handleSelect(optionValue)}
              activeOpacity={0.7}
              style={[
                styles.option,
                { width: `${(100 / columns) - 2}%` },
                selected && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}
                numberOfLines={2}
              >
                {optionLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  optionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySurface,
  },
  optionText: {
    fontSize: 13.5,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});

export default React.memo(OptionSelector);
