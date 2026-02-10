import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ActionItem } from '../types';
import { colors, layout, spacing, typography } from '../constants/theme';
import { Circle, CheckCircle, Clock, Calendar } from 'lucide-react-native';
import { format, isToday, isTomorrow } from 'date-fns';

interface ActionItemCardProps {
  item: ActionItem;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export const ActionItemCard: React.FC<ActionItemCardProps> = ({ item, onPress, onToggleComplete }) => {
  const isCompleted = !!item.completedAt;

  const formatDateDisplay = () => {
    if (!item.date) return null;
    const date = new Date(item.date);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity onPress={onToggleComplete} style={styles.checkButton}>
        {isCompleted ? (
          <CheckCircle size={24} color={colors.success} fill={colors.success + '20'} />
        ) : (
          <Circle size={24} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.text, isCompleted && styles.textCompleted]}>
          {item.text}
        </Text>
        
        {(item.date || item.time) && (
          <View style={styles.metaContainer}>
            {item.date && (
              <View style={styles.metaItem}>
                <Calendar size={14} color={colors.textMuted} />
                <Text style={styles.metaText}>{formatDateDisplay()}</Text>
              </View>
            )}
            {item.time && (
              <View style={styles.metaItem}>
                <Clock size={14} color={item.date && isToday(new Date(item.date)) ? colors.primary : colors.textMuted} />
                <Text style={[
                  styles.metaText, 
                  item.date && isToday(new Date(item.date)) ? { color: colors.primary } : {}
                ]}>
                  {item.time}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    backgroundColor: colors.surface,
    borderRadius: layout.radius,
    marginBottom: spacing.s,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkButton: {
    marginRight: spacing.m,
  },
  content: {
    flex: 1,
  },
  text: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: 4,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    fontSize: 12,
  },
});
