import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import type { DayNumber, DaySlot, ValidationResult } from "@/lib/timetable/builder/types";
import {
    getSlotErrors,
    isSlotWarning,
} from "@/lib/timetable/builder/validation";
import { formatTime } from "@/lib/timetable/engine";

interface SlotRowProps {
  slot: DaySlot;
  day: DayNumber;
  validation: ValidationResult;
  isLast: boolean;
  onPress: () => void;
  onMergeDown: () => void;
}

export default function SlotRow({
  slot,
  day,
  validation,
  isLast,
  onPress,
  onMergeDown,
}: SlotRowProps) {
  const colors = Colors.dark;
  const isFilled = slot.subjectName.trim() !== "";
  const hasError = getSlotErrors(validation, day, slot.id).length > 0;
  const hasWarning = !isFilled && isSlotWarning(validation, day, slot.id);

  const statusColor = hasError
    ? colors.danger
    : hasWarning
      ? colors.warning
      : isFilled
        ? colors.success
        : colors.textTertiary;

  return (
    <View>
      <Pressable
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: pressed ? colors.surfaceElevated : colors.surface,
            borderColor: hasError ? colors.danger + "60" : colors.border,
          },
        ]}
        onPress={onPress}
      >
        {/* Status dot */}
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />

        {/* Time range */}
        <View style={styles.timeColumn}>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(slot.startTime)}
          </Text>
          <Text style={[styles.timeDash, { color: colors.textTertiary }]}>
            –
          </Text>
          <Text style={[styles.timeText, { color: colors.textSecondary }]}>
            {formatTime(slot.endTime)}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.contentColumn}>
          {isFilled ? (
            <>
              <Text
                style={[styles.subjectName, { color: colors.text }]}
                numberOfLines={1}
              >
                {slot.subjectName}
              </Text>
              <View style={styles.details}>
                {slot.subjectCode ? (
                  <Text
                    style={[styles.detailText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {slot.subjectCode}
                  </Text>
                ) : null}
                {slot.location ? (
                  <Text
                    style={[styles.detailText, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    · {slot.location}
                  </Text>
                ) : null}
              </View>
            </>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Tap to fill
            </Text>
          )}
        </View>

        {/* Type badge */}
        {isFilled && (
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  slot.type === "LAB"
                    ? colors.warning + "20"
                    : colors.primary + "15",
              },
            ]}
          >
            <Text
              style={[
                styles.typeText,
                {
                  color:
                    slot.type === "LAB" ? colors.warning : colors.primaryLight,
                },
              ]}
            >
              {slot.type}
            </Text>
          </View>
        )}

        {/* Edit icon */}
        <FontAwesome
          name={isFilled ? "pencil" : "plus"}
          size={12}
          color={colors.textTertiary}
          style={styles.editIcon}
        />
      </Pressable>

      {/* Merge affordance between slots */}
      {!isLast && (
        <Pressable
          style={({ pressed }) => [
            styles.mergeButton,
            {
              opacity: pressed ? 0.8 : 0.4,
            },
          ]}
          onPress={onMergeDown}
          hitSlop={8}
        >
          <FontAwesome name="compress" size={10} color={colors.textTertiary} />
          <Text style={[styles.mergeText, { color: colors.textTertiary }]}>
            merge
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeColumn: {
    alignItems: "center",
    minWidth: 58,
  },
  timeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  timeDash: {
    fontSize: FontSize.xs,
    lineHeight: 12,
  },
  contentColumn: {
    flex: 1,
    marginLeft: Spacing.xs,
  },
  subjectName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  details: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginTop: 2,
  },
  detailText: {
    fontSize: FontSize.xs,
  },
  emptyText: {
    fontSize: FontSize.sm,
    fontStyle: "italic",
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeText: {
    fontSize: 10,
    fontWeight: FontWeight.semibold,
  },
  editIcon: {
    marginLeft: Spacing.xs,
  },
  mergeButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
  },
  mergeText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
});
