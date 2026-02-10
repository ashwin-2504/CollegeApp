import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { colors, layout, spacing, typography } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm';
  loading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'default',
  loading, 
  leftIcon,
  style, 
  disabled,
  ...props 
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceHighlight;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surfaceHighlight;
      case 'danger': return colors.danger;
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    switch (variant) {
      case 'primary': return colors.primaryForeground;
      case 'secondary': return colors.text;
      case 'ghost': return colors.text;
      case 'danger': return '#FFFFFF';
      default: return colors.text;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          paddingVertical: size === 'sm' ? spacing.s : 12,
          paddingHorizontal: size === 'sm' ? spacing.m : spacing.l,
        },
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: spacing.s }}>{leftIcon}</View>} 
          <Text style={[styles.text, { color: getTextColor(), fontSize: size === 'sm' ? 14 : 16 }]}>
            {children}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
  },
});
