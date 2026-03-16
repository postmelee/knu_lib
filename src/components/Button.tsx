import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from '@/components/Text';

// ── Props ──

type ButtonVariant = 'fill' | 'weak';
type ButtonColor = 'primary' | 'dark' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface ButtonProps {
  children: string;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

// ── Color Palette (TDS 참조) ──

const FILL_COLORS: Record<ButtonColor, { bg: string; text: string }> = {
  primary: { bg: '#3182f6', text: '#ffffff' },
  dark:    { bg: '#191f28', text: '#ffffff' },
  danger:  { bg: '#f04452', text: '#ffffff' },
};

const WEAK_COLORS: Record<ButtonColor, { bg: string; text: string }> = {
  primary: { bg: '#e8f3ff', text: '#3182f6' },
  dark:    { bg: '#f2f4f6', text: '#4e5968' },
  danger:  { bg: '#ffecee', text: '#f04452' },
};

const DISABLED_FILL = { bg: '#e5e8eb', text: '#b0b8c1' };
const DISABLED_WEAK = { bg: '#f2f4f6', text: '#b0b8c1' };

// ── Size Specs ──

const SIZE_SPECS: Record<ButtonSize, { height: number; paddingH: number; fontSize: number; radius: number }> = {
  small:  { height: 32, paddingH: 12, fontSize: 13, radius: 8 },
  medium: { height: 40, paddingH: 16, fontSize: 14, radius: 10 },
  large:  { height: 48, paddingH: 20, fontSize: 15, radius: 12 },
  xlarge: { height: 56, paddingH: 24, fontSize: 16, radius: 14 },
};

// ── Component ──

export function Button({
  children,
  variant = 'fill',
  color = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  onPress,
  style,
}: ButtonProps) {
  const sizeSpec = SIZE_SPECS[size];
  const isDisabled = disabled || loading;

  // 색상 결정
  let colorSet: { bg: string; text: string };
  if (isDisabled) {
    colorSet = variant === 'fill' ? DISABLED_FILL : DISABLED_WEAK;
  } else {
    colorSet = variant === 'fill' ? FILL_COLORS[color] : WEAK_COLORS[color];
  }

  const containerStyle: ViewStyle = {
    backgroundColor: colorSet.bg,
    height: sizeSpec.height,
    paddingHorizontal: sizeSpec.paddingH,
    borderRadius: sizeSpec.radius,
  };

  const textStyle: TextStyle = {
    color: colorSet.text,
    fontSize: sizeSpec.fontSize,
    fontWeight: 'bold',
  };

  return (
    <TouchableOpacity
      style={[styles.base, containerStyle, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colorSet.text} />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
