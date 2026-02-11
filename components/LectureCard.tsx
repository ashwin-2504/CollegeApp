import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { formatTime } from "@/lib/timetable/engine";
import { type LectureSlot } from "@/lib/types";
import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface LectureCardProps {
  slot: LectureSlot;
  variant: "current" | "next" | "schedule";
}

export default function LectureCard({ slot, variant }: LectureCardProps) {
  const colors = Colors.dark;

  const variantColors = {
    current: {
      bg: colors.primary + "18",
      border: colors.primary,
      label: "NOW",
      labelColor: colors.primary,
    },
    next: {
      bg: colors.accent + "15",
      border: colors.accent,
      label: "NEXT",
      labelColor: colors.accent,
    },
    schedule: {
      bg: colors.surfaceElevated,
      border: colors.border,
      label: "",
      labelColor: "",
    },
  };

  const v = variantColors[variant];

  return (
    <View
      style={[styles.card, { backgroundColor: v.bg, borderColor: v.border }]}
    >
      {v.label ? (
        <View style={[styles.labelBadge, { backgroundColor: v.border + "25" }]}>
          <Text style={[styles.labelText, { color: v.labelColor }]}>
            {v.label}
          </Text>
        </View>
      ) : null}

      <Text
        style={[styles.subjectName, { color: colors.text }]}
        numberOfLines={1}
      >
        {slot.subjectName}
      </Text>

      {slot.subjectCode && (
        <Text style={[styles.subjectCode, { color: colors.textSecondary }]}>
          {slot.subjectCode}
        </Text>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <FontAwesome name="clock-o" size={12} color={colors.textSecondary} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            {formatTime(slot.startTime)} — {formatTime(slot.endTime)}
          </Text>
        </View>

        {slot.location && (
          <View style={styles.detailRow}>
            <FontAwesome
              name="map-marker"
              size={12}
              color={colors.textSecondary}
            />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {slot.location}
            </Text>
          </View>
        )}

        {slot.faculty && (
          <View style={styles.detailRow}>
            <FontAwesome name="user" size={12} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {slot.faculty}
            </Text>
          </View>
        )}
      </View>

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
              color: slot.type === "LAB" ? colors.warning : colors.primaryLight,
            },
          ]}
        >
          {slot.type}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  labelBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  labelText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  subjectName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  subjectCode: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  details: {
    marginTop: Spacing.sm,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: FontSize.sm,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  typeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
