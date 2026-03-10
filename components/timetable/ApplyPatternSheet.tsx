import React, { useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import {
    ALL_DAYS,
    DAY_LABELS,
    DAY_SHORT_LABELS,
    type DayNumber,
} from "@/lib/timetable/builder/types";

interface ApplyPatternSheetProps {
  visible: boolean;
  fromDay: DayNumber;
  onApply: (toDays: DayNumber[]) => void;
  onClose: () => void;
}

export default function ApplyPatternSheet({
  visible,
  fromDay,
  onApply,
  onClose,
}: ApplyPatternSheetProps) {
  const colors = Colors.dark;
  const [selected, setSelected] = useState<Set<DayNumber>>(new Set());

  const otherDays = ALL_DAYS.filter((d) => d !== fromDay);

  const toggleDay = (day: DayNumber) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(otherDays));
  };

  const handleApply = () => {
    if (selected.size === 0) return;

    const dayNames = [...selected]
      .sort()
      .map((d) => DAY_SHORT_LABELS[d])
      .join(", ");

    Alert.alert(
      "Apply Pattern",
      `Copy ${DAY_LABELS[fromDay]}'s schedule to ${dayNames}? Existing data on those days will be replaced.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply",
          onPress: () => {
            onApply([...selected]);
            setSelected(new Set());
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleBar}>
            <View
              style={[styles.handle, { backgroundColor: colors.textTertiary }]}
            />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            Apply {DAY_LABELS[fromDay]}'s pattern to…
          </Text>

          {/* Day checkboxes */}
          <View style={styles.dayList}>
            {otherDays.map((day) => {
              const isSelected = selected.has(day);
              return (
                <Pressable
                  key={day}
                  style={[
                    styles.dayRow,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : colors.background,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : "transparent",
                        borderColor: isSelected
                          ? colors.primary
                          : colors.textTertiary,
                      },
                    ]}
                  >
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text
                    style={[
                      styles.dayText,
                      {
                        color: isSelected ? colors.text : colors.textSecondary,
                      },
                    ]}
                  >
                    {DAY_LABELS[day]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.selectAllButton,
                {
                  borderColor: colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={selectAll}
            >
              <Text
                style={[styles.selectAllText, { color: colors.textSecondary }]}
              >
                Select All
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.applyButton,
                {
                  backgroundColor:
                    selected.size > 0 ? colors.primary : colors.textTertiary,
                  opacity: pressed && selected.size > 0 ? 0.85 : 1,
                },
              ]}
              onPress={handleApply}
              disabled={selected.size === 0}
            >
              <Text style={styles.applyText}>
                Apply to {selected.size || "…"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: Spacing.xxl,
  },
  handleBar: {
    alignItems: "center",
    paddingTop: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  dayList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  dayText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  selectAllButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  selectAllText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  applyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
