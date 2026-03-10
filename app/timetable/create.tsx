import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useReducer, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ApplyPatternSheet from "@/components/timetable/ApplyPatternSheet";
import DaySection from "@/components/timetable/DaySection";
import SlotEditorSheet from "@/components/timetable/SlotEditorSheet";
import ValidationFooter from "@/components/timetable/ValidationFooter";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { getAllLectureSlots, replaceAllSlots } from "@/lib/db/lectureSlots";
import {
    PRESETS,
    generateEmptyDays,
    generateFromPreset,
} from "@/lib/timetable/builder/presets";
import {
    createInitialState,
    timetableReducer,
} from "@/lib/timetable/builder/reducer";
import {
    ALL_DAYS,
    type DayNumber,
    type DaySlot
} from "@/lib/timetable/builder/types";
import type { CreateLectureSlotInput } from "@/lib/types";

export default function CreateTimetableScreen() {
  const colors = Colors.dark;
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [state, dispatch] = useReducer(
    timetableReducer,
    undefined,
    createInitialState,
  );
  const [saving, setSaving] = useState(false);
  const [copyDay, setCopyDay] = useState<DayNumber | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load existing timetable data on mount (edit mode)
  React.useEffect(() => {
    (async () => {
      try {
        const existing = await getAllLectureSlots(db);
        if (existing.length > 0) {
          // Group by day
          const days = {} as Record<DayNumber, DaySlot[]>;
          for (const d of ALL_DAYS) days[d] = [];

          for (const slot of existing) {
            const day = slot.dayOfWeek as DayNumber;
            if (days[day]) {
              days[day].push({
                id: slot.id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                subjectName: slot.subjectName,
                subjectCode: slot.subjectCode ?? "",
                faculty: slot.faculty ?? "",
                location: slot.location ?? "",
                type: slot.type,
              });
            }
          }

          dispatch({ type: "LOAD_EXISTING", days });
        }
      } catch {
        // Silent — start fresh
      } finally {
        setLoaded(true);
      }
    })();
  }, [db]);

  // Find the slot being edited
  const activeSlot = state.activeEditor
    ? state.days[state.activeEditor.day]?.find(
        (s) => s.id === state.activeEditor!.slotId,
      )
    : null;

  const handleSave = useCallback(async () => {
    if (!state.validation.canSave) return;

    // Confirm replace
    Alert.alert(
      "Save Timetable",
      "This will replace your existing timetable. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async () => {
            setSaving(true);
            try {
              // Convert state to CreateLectureSlotInput[]
              const inputs: CreateLectureSlotInput[] = [];
              for (const day of ALL_DAYS) {
                for (const slot of state.days[day]) {
                  if (!slot.subjectName.trim()) continue; // skip empty
                  inputs.push({
                    dayOfWeek: day,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    subjectName: slot.subjectName.trim(),
                    subjectCode: slot.subjectCode.trim() || null,
                    faculty: slot.faculty.trim() || null,
                    location: slot.location.trim() || null,
                    type: slot.type,
                    batch: null,
                  });
                }
              }

              await replaceAllSlots(db, inputs);
              router.back();
            } catch (e) {
              Alert.alert(
                "Error",
                "Failed to save timetable. Please try again.",
              );
            } finally {
              setSaving(false);
            }
          },
        },
      ],
    );
  }, [state, db]);

  if (!loaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading…
        </Text>
      </View>
    );
  }

  // ── Preset Selection (Phase 1) ───────────────────────────

  if (state.phase === "preset") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingBottom: insets.bottom },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.presetContent}
          style={styles.scrollView}
        >
          <Text style={[styles.presetTitle, { color: colors.text }]}>
            Choose a schedule template
          </Text>
          <Text
            style={[styles.presetSubtitle, { color: colors.textSecondary }]}
          >
            Pick the closest match to your college schedule.{"\n"}You can add,
            remove, or merge slots per day afterward.
          </Text>

          {PRESETS.map((preset, index) => (
            <Pressable
              key={preset.label}
              style={({ pressed }) => [
                styles.presetCard,
                {
                  backgroundColor: pressed
                    ? colors.surfaceElevated
                    : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {
                dispatch({
                  type: "APPLY_PRESET",
                  days: generateFromPreset(index),
                });
                dispatch({ type: "START_FILL" });
              }}
            >
              <View style={styles.presetHeader}>
                <FontAwesome name="th" size={16} color={colors.primary} />
                <Text style={[styles.presetLabel, { color: colors.text }]}>
                  {preset.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.presetDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {preset.description}
              </Text>
              <View style={styles.presetSlots}>
                {preset.slots.map((s, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.presetSlotText,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {s.start}–{s.end}
                  </Text>
                ))}
              </View>
            </Pressable>
          ))}

          {/* Start from scratch */}
          <Pressable
            style={({ pressed }) => [
              styles.scratchCard,
              {
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              dispatch({
                type: "APPLY_PRESET",
                days: generateEmptyDays(),
              });
              dispatch({ type: "START_FILL" });
            }}
          >
            <FontAwesome name="pencil" size={14} color={colors.textSecondary} />
            <Text style={[styles.scratchText, { color: colors.textSecondary }]}>
              Start from scratch
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  // ── Fill Phase (Phase 2) ─────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.fillContent,
          { paddingBottom: 80 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {ALL_DAYS.map((day) => (
          <DaySection
            key={day}
            day={day}
            slots={state.days[day]}
            validation={state.validation}
            dispatch={dispatch}
            onCopyPress={setCopyDay}
          />
        ))}

        {/* Reset button at bottom */}
        <Pressable
          style={({ pressed }) => [
            styles.resetButton,
            {
              borderColor: colors.danger + "40",
              opacity: pressed ? 0.7 : 1,
            },
          ]}
          onPress={() => {
            Alert.alert(
              "Reset Timetable",
              "This will clear all data and go back to template selection.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => dispatch({ type: "RESET_ALL" }),
                },
              ],
            );
          }}
        >
          <FontAwesome name="refresh" size={12} color={colors.danger} />
          <Text style={[styles.resetText, { color: colors.danger }]}>
            Reset & Choose Template
          </Text>
        </Pressable>
      </ScrollView>

      {/* Sticky validation footer */}
      <View style={{ paddingBottom: insets.bottom }}>
        <ValidationFooter
          validation={state.validation}
          onSave={handleSave}
          saving={saving}
        />
      </View>

      {/* Slot editor bottom-sheet */}
      {activeSlot && state.activeEditor && (
        <SlotEditorSheet
          slot={activeSlot}
          visible={true}
          onSave={(data) =>
            dispatch({
              type: "FILL_SLOT",
              day: state.activeEditor!.day,
              slotId: state.activeEditor!.slotId,
              data,
            })
          }
          onClear={() =>
            dispatch({
              type: "CLEAR_SLOT",
              day: state.activeEditor!.day,
              slotId: state.activeEditor!.slotId,
            })
          }
          onRemove={() =>
            dispatch({
              type: "REMOVE_SLOT",
              day: state.activeEditor!.day,
              slotId: state.activeEditor!.slotId,
            })
          }
          onUnmerge={() =>
            dispatch({
              type: "UNMERGE",
              day: state.activeEditor!.day,
              slotId: state.activeEditor!.slotId,
            })
          }
          onClose={() => dispatch({ type: "CLOSE_EDITOR" })}
          canUnmerge={
            // Can unmerge if slot spans > 55 min (likely merged)
            (() => {
              const [sh, sm] = activeSlot.startTime.split(":").map(Number);
              const [eh, em] = activeSlot.endTime.split(":").map(Number);
              return eh * 60 + em - (sh * 60 + sm) > 55;
            })()
          }
        />
      )}

      {/* Apply pattern sheet */}
      {copyDay !== null && (
        <ApplyPatternSheet
          visible={true}
          fromDay={copyDay}
          onApply={(toDays) =>
            dispatch({ type: "APPLY_PATTERN", fromDay: copyDay, toDays })
          }
          onClose={() => setCopyDay(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingText: {
    textAlign: "center",
    marginTop: Spacing.xxxl,
    fontSize: FontSize.md,
  },

  // Preset phase
  presetContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  presetTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.md,
  },
  presetSubtitle: {
    fontSize: FontSize.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  presetCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  presetHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  presetLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  presetDescription: {
    fontSize: FontSize.sm,
  },
  presetSlots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  presetSlotText: {
    fontSize: 10,
    fontWeight: FontWeight.medium,
  },
  scratchCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  scratchText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },

  // Fill phase
  fillContent: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  resetText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});
