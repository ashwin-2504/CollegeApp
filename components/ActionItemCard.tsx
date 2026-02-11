import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { formatTime } from "@/lib/timetable/engine";
import { type ActionItem } from "@/lib/types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeOutUp,
    Layout,
} from "react-native-reanimated";

interface ActionItemCardProps {
  item: ActionItem;
  onToggleComplete: (id: string) => void;
  onPress?: (id: string) => void;
  index?: number;
}

export default function ActionItemCard({
  item,
  onToggleComplete,
  onPress,
  index = 0,
}: ActionItemCardProps) {
  const colors = Colors.dark;
  const isCompleted = !!item.completedAt;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      exiting={FadeOutUp.springify()}
      layout={Layout.springify()}
    >
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
          isCompleted && styles.completedCard,
        ]}
        onPress={() => onPress?.(item.id)}
      >
        <Pressable
          onPress={() => onToggleComplete(item.id)}
          hitSlop={12}
          style={styles.checkboxContainer}
        >
          <View
            style={[
              styles.checkbox,
              { borderColor: isCompleted ? colors.success : colors.border },
              isCompleted && { backgroundColor: colors.success },
            ]}
          >
            {isCompleted && (
              <FontAwesome name="check" size={10} color={colors.background} />
            )}
          </View>
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[
              styles.text,
              { color: colors.text },
              isCompleted && {
                textDecorationLine: "line-through",
                color: colors.textTertiary,
              },
            ]}
            numberOfLines={2}
          >
            {item.text}
          </Text>

          <View style={styles.meta}>
            {item.time && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primaryDark + "30" },
                ]}
              >
                <FontAwesome name="clock-o" size={10} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {formatTime(item.time)}
                </Text>
              </View>
            )}
            {item.date && !item.time && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.accent + "20" },
                ]}
              >
                <FontAwesome name="calendar" size={10} color={colors.accent} />
                <Text style={[styles.badgeText, { color: colors.accent }]}>
                  {formatDateLabel(item.date)}
                </Text>
              </View>
            )}
            {item.notes && (
              <FontAwesome
                name="sticky-note-o"
                size={11}
                color={colors.textTertiary}
                style={{ marginLeft: Spacing.xs }}
              />
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  completedCard: {
    opacity: 0.6,
  },
  checkboxContainer: {
    paddingTop: 2,
    paddingRight: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: 22,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    gap: Spacing.sm,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
