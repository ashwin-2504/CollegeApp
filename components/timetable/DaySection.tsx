import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import type {
    DayNumber,
    DaySlot,
    TimetableAction,
    ValidationResult,
} from "@/lib/timetable/builder/types";
import { DAY_LABELS } from "@/lib/timetable/builder/types";
import SlotRow from "./SlotRow";

interface DaySectionProps {
  day: DayNumber;
  slots: DaySlot[];
  validation: ValidationResult;
  dispatch: React.Dispatch<TimetableAction>;
  onCopyPress: (day: DayNumber) => void;
}

export default function DaySection({
  day,
  slots,
  validation,
  dispatch,
  onCopyPress,
}: DaySectionProps) {
  const colors = Colors.dark;
  const filledCount = slots.filter((s) => s.subjectName.trim()).length;

  const handleMergeDown = (slotId: string, index: number) => {
    if (index >= slots.length - 1) return;

    const nextSlot = slots[index + 1];
    const nextHasData = nextSlot.subjectName.trim() !== "";

    if (nextHasData) {
      Alert.alert(
        "Merge Slots",
        `The next slot has data (${nextSlot.subjectName}). Merging will discard it. Continue?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Merge",
            style: "destructive",
            onPress: () => dispatch({ type: "MERGE_DOWN", day, slotId }),
          },
        ],
      );
    } else {
      dispatch({ type: "MERGE_DOWN", day, slotId });
    }
  };

  const handleAddSlot = () => {
    // Add a slot after the last one, with default 1-hour duration
    const lastSlot = slots[slots.length - 1];
    let startTime = "09:00";
    let endTime = "10:00";

    if (lastSlot) {
      // Continue from last slot's end
      const [h, m] = lastSlot.endTime.split(":").map(Number);
      startTime = lastSlot.endTime;
      const endH = h + 1;
      endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }

    dispatch({ type: "ADD_SLOT", day, startTime, endTime });
  };

  return (
    <View style={styles.container}>
      {/* Day Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.dayLabel, { color: colors.text }]}>
            {DAY_LABELS[day]}
          </Text>
          <Text style={[styles.slotCount, { color: colors.textTertiary }]}>
            {filledCount}/{slots.length}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Copy button */}
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={() => onCopyPress(day)}
            hitSlop={8}
          >
            <FontAwesome name="copy" size={13} color={colors.textSecondary} />
          </Pressable>

          {/* Clear day */}
          {filledCount > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.headerButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={() => {
                Alert.alert(
                  `Clear ${DAY_LABELS[day]}?`,
                  "This will clear all slot data for this day. Time structure is preserved.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear",
                      style: "destructive",
                      onPress: () => dispatch({ type: "CLEAR_DAY", day }),
                    },
                  ],
                );
              }}
              hitSlop={8}
            >
              <FontAwesome
                name="eraser"
                size={13}
                color={colors.textTertiary}
              />
            </Pressable>
          )}
        </View>
      </View>

      {/* Slot rows */}
      {slots.length > 0 ? (
        <View style={styles.slotList}>
          {slots.map((slot, index) => (
            <SlotRow
              key={slot.id}
              slot={slot}
              day={day}
              validation={validation}
              isLast={index === slots.length - 1}
              onPress={() =>
                dispatch({ type: "SET_EDITOR", day, slotId: slot.id })
              }
              onMergeDown={() => handleMergeDown(slot.id, index)}
            />
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyDay, { color: colors.textTertiary }]}>
          No slots defined
        </Text>
      )}

      {/* Add slot button */}
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          {
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={handleAddSlot}
      >
        <FontAwesome name="plus" size={12} color={colors.textTertiary} />
        <Text style={[styles.addText, { color: colors.textTertiary }]}>
          Add Slot
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  dayLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  slotCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  slotList: {
    gap: 0,
  },
  emptyDay: {
    fontSize: FontSize.sm,
    fontStyle: "italic",
    paddingVertical: Spacing.md,
    textAlign: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
