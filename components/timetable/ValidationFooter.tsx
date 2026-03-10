import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import type { ValidationResult } from "@/lib/timetable/builder/types";

interface ValidationFooterProps {
  validation: ValidationResult;
  onSave: () => void;
  saving: boolean;
}

export default function ValidationFooter({
  validation,
  onSave,
  saving,
}: ValidationFooterProps) {
  const colors = Colors.dark;
  const { filledCount, totalCount, errors, warnings, canSave } = validation;

  const emptyCount = warnings.filter((w) => w.type === "EMPTY_SLOT").length;

  return (
    <View
      style={[
        styles.footer,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.stats}>
        <Text style={[styles.statText, { color: colors.success }]}>
          ✔ {filledCount}/{totalCount}
        </Text>
        {emptyCount > 0 && (
          <Text style={[styles.statText, { color: colors.warning }]}>
            ⚠ {emptyCount} empty
          </Text>
        )}
        {errors.length > 0 && (
          <Text style={[styles.statText, { color: colors.danger }]}>
            ✕ {errors.length} {errors.length === 1 ? "error" : "errors"}
          </Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          {
            backgroundColor: canSave ? colors.primary : colors.textTertiary,
            opacity: pressed && canSave ? 0.85 : saving ? 0.6 : 1,
          },
        ]}
        onPress={onSave}
        disabled={!canSave || saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving..." : "Save Timetable"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  stats: {
    flexDirection: "row",
    gap: Spacing.md,
    flexShrink: 1,
  },
  statText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  saveButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  saveText: {
    color: "#fff",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});
