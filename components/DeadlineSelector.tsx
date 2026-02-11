import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { type DeadlineIntent } from "@/lib/types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface DeadlineSelectorProps {
  value: DeadlineIntent;
  onChange: (intent: DeadlineIntent) => void;
}

const options: { key: DeadlineIntent; label: string; icon: string }[] = [
  { key: "none", label: "No Deadline", icon: "inbox" },
  { key: "date", label: "Before a Date", icon: "calendar" },
  { key: "time", label: "Before a Time", icon: "clock-o" },
];

export default function DeadlineSelector({
  value,
  onChange,
}: DeadlineSelectorProps) {
  const colors = Colors.dark;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        Deadline
      </Text>
      <View style={styles.pills}>
        {options.map((opt) => {
          const isActive = value === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive
                    ? colors.primary + "20"
                    : colors.surfaceElevated,
                  borderColor: isActive ? colors.primary : colors.border,
                },
              ]}
            >
              <FontAwesome
                name={opt.icon as any}
                size={13}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: isActive ? colors.primary : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
  pills: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
