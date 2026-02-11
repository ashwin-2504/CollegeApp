import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import {
    bulkAddLectureSlots,
    clearSlotsForDay,
    getAllLectureSlots
} from "@/lib/db/lectureSlots";
import { DAY_SHORT } from "@/lib/timetable/engine";
import { type CreateLectureSlotInput } from "@/lib/types";

interface SlotForm {
  key: string;
  subjectName: string;
  subjectCode: string;
  faculty: string;
  location: string;
  startTime: Date;
  endTime: Date;
  type: "THEORY" | "LAB" | "OTHER";
}

function createEmptySlot(): SlotForm {
  const start = new Date();
  start.setHours(9, 0, 0, 0);
  const end = new Date();
  end.setHours(10, 0, 0, 0);
  return {
    key: Math.random().toString(36).substring(2, 9),
    subjectName: "",
    subjectCode: "",
    faculty: "",
    location: "",
    startTime: start,
    endTime: end,
    type: "THEORY",
  };
}

function timeToString(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatTimeDisplay(d: Date): string {
  const h = d.getHours() % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  const period = d.getHours() >= 12 ? "PM" : "AM";
  return `${h}:${m} ${period}`;
}

// Days Mon–Sat (1–6), skip Sunday (0)
const SETUP_DAYS = [1, 2, 3, 4, 5, 6];

export default function TimetableSetupScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;

  const [selectedDay, setSelectedDay] = useState(1); // Monday
  const [slots, setSlots] = useState<SlotForm[]>([createEmptySlot()]);
  const [existingCount, setExistingCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<{
    slotKey: string;
    field: "startTime" | "endTime";
  } | null>(null);

  // Load existing slots for selected day
  useFocusEffect(
    useCallback(() => {
      loadExisting();
    }, [selectedDay]),
  );

  const loadExisting = async () => {
    const all = await getAllLectureSlots(db);
    const daySlots = all.filter((s) => s.dayOfWeek === selectedDay);
    setExistingCount(daySlots.length);
  };

  const updateSlot = (key: string, field: keyof SlotForm, value: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s)),
    );
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, createEmptySlot()]);
  };

  const duplicateLastSlot = () => {
    setSlots((prev) => {
      if (prev.length === 0) return [createEmptySlot()];
      const last = prev[prev.length - 1];
      // Shift time forward by 1 hour
      const newStart = new Date(last.endTime);
      const newEnd = new Date(last.endTime);
      newEnd.setHours(newEnd.getHours() + 1);
      return [
        ...prev,
        {
          ...last,
          key: Math.random().toString(36).substring(2, 9),
          startTime: newStart,
          endTime: newEnd,
        },
      ];
    });
  };

  const removeSlot = (key: string) => {
    setSlots((prev) => prev.filter((s) => s.key !== key));
  };

  const handleClearDay = () => {
    Alert.alert(
      `Clear ${DAY_SHORT[selectedDay]}?`,
      "This will remove all existing lectures for this day.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await clearSlotsForDay(db, selectedDay);
            setExistingCount(0);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ],
    );
  };

  const handleSave = async () => {
    const validSlots = slots.filter((s) => s.subjectName.trim());
    if (validSlots.length === 0) {
      Alert.alert(
        "No Lectures",
        "Add at least one lecture with a subject name",
      );
      return;
    }

    setSaving(true);
    try {
      const inputs: CreateLectureSlotInput[] = validSlots.map((s) => ({
        dayOfWeek: selectedDay,
        startTime: timeToString(s.startTime),
        endTime: timeToString(s.endTime),
        subjectCode: s.subjectCode.trim() || null,
        subjectName: s.subjectName.trim(),
        faculty: s.faculty.trim() || null,
        location: s.location.trim() || null,
        type: s.type,
        batch: null,
      }));

      await bulkAddLectureSlots(db, inputs);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Reset form
      setSlots([createEmptySlot()]);
      await loadExisting();

      Alert.alert(
        "Saved!",
        `${inputs.length} lecture(s) added for ${DAY_SHORT[selectedDay]}`,
        [
          { text: "Add More", style: "default" },
          { text: "Done", onPress: () => router.back() },
        ],
      );
    } catch (err) {
      Alert.alert("Error", "Failed to save timetable");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Day Selector */}
      <View style={styles.dayPills}>
        {SETUP_DAYS.map((day) => (
          <Pressable
            key={day}
            style={[
              styles.dayPill,
              {
                backgroundColor:
                  selectedDay === day
                    ? colors.primary + "20"
                    : colors.surfaceElevated,
                borderColor:
                  selectedDay === day ? colors.primary : colors.border,
              },
            ]}
            onPress={() => {
              setSelectedDay(day);
              setSlots([createEmptySlot()]);
            }}
          >
            <Text
              style={[
                styles.dayPillText,
                {
                  color:
                    selectedDay === day ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {DAY_SHORT[day]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Existing info + Clear */}
      {existingCount > 0 && (
        <View
          style={[
            styles.existingBar,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.existingText, { color: colors.textSecondary }]}>
            {existingCount} existing lecture(s) for {DAY_SHORT[selectedDay]}
          </Text>
          <Pressable onPress={handleClearDay}>
            <Text style={[styles.clearText, { color: colors.danger }]}>
              Clear Day
            </Text>
          </Pressable>
        </View>
      )}

      {/* Slot Forms */}
      {slots.map((slot, idx) => (
        <View
          key={slot.key}
          style={[
            styles.slotCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.slotHeader}>
            <Text style={[styles.slotNumber, { color: colors.textTertiary }]}>
              Lecture {idx + 1}
            </Text>
            {slots.length > 1 && (
              <Pressable onPress={() => removeSlot(slot.key)} hitSlop={8}>
                <FontAwesome
                  name="times"
                  size={16}
                  color={colors.textTertiary}
                />
              </Pressable>
            )}
          </View>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Subject Name *"
            placeholderTextColor={colors.textTertiary}
            value={slot.subjectName}
            onChangeText={(v) => updateSlot(slot.key, "subjectName", v)}
          />

          <View style={styles.row}>
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Subject Code"
              placeholderTextColor={colors.textTertiary}
              value={slot.subjectCode}
              onChangeText={(v) => updateSlot(slot.key, "subjectCode", v)}
            />
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Location"
              placeholderTextColor={colors.textTertiary}
              value={slot.location}
              onChangeText={(v) => updateSlot(slot.key, "location", v)}
            />
          </View>

          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="Faculty"
            placeholderTextColor={colors.textTertiary}
            value={slot.faculty}
            onChangeText={(v) => updateSlot(slot.key, "faculty", v)}
          />

          {/* Time row */}
          <View style={styles.row}>
            <Pressable
              style={[
                styles.timeButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                setActiveTimePicker({ slotKey: slot.key, field: "startTime" })
              }
            >
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                Start
              </Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>
                {formatTimeDisplay(slot.startTime)}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.timeButton,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() =>
                setActiveTimePicker({ slotKey: slot.key, field: "endTime" })
              }
            >
              <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>
                End
              </Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>
                {formatTimeDisplay(slot.endTime)}
              </Text>
            </Pressable>
          </View>

          {activeTimePicker?.slotKey === slot.key && (
            <DateTimePicker
              value={slot[activeTimePicker.field]}
              mode="time"
              display="spinner"
              onChange={(_, selected) => {
                if (Platform.OS !== "ios") setActiveTimePicker(null);
                if (selected)
                  updateSlot(slot.key, activeTimePicker!.field, selected);
              }}
              themeVariant="dark"
            />
          )}

          {/* Type selector */}
          <View style={styles.typePills}>
            {(["THEORY", "LAB", "OTHER"] as const).map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.typePill,
                  {
                    backgroundColor:
                      slot.type === t
                        ? colors.primary + "20"
                        : colors.background,
                    borderColor:
                      slot.type === t ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => updateSlot(slot.key, "type", t)}
              >
                <Text
                  style={[
                    styles.typePillText,
                    {
                      color:
                        slot.type === t ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Slot actions */}
      <View style={styles.slotActions}>
        <Pressable
          style={[styles.addButton, { borderColor: colors.border }]}
          onPress={addSlot}
        >
          <FontAwesome name="plus" size={14} color={colors.textSecondary} />
          <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>
            Add Slot
          </Text>
        </Pressable>

        <Pressable
          style={[styles.addButton, { borderColor: colors.border }]}
          onPress={duplicateLastSlot}
        >
          <FontAwesome name="copy" size={14} color={colors.textSecondary} />
          <Text style={[styles.addButtonText, { color: colors.textSecondary }]}>
            Duplicate Last
          </Text>
        </Pressable>
      </View>

      {/* Save */}
      <Pressable
        style={({ pressed }) => [
          styles.saveButton,
          {
            backgroundColor: colors.primary,
            opacity: pressed || saving ? 0.7 : 1,
          },
        ]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : `Save ${DAY_SHORT[selectedDay]} Lectures`}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 60,
    gap: Spacing.lg,
  },
  dayPills: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "center",
  },
  dayPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  dayPillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  existingBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  existingText: {
    fontSize: FontSize.sm,
  },
  clearText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  slotCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  slotNumber: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    fontSize: FontSize.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  timeButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  timeLabel: {
    fontSize: FontSize.xs,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  typePills: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  typePill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  typePillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  slotActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  addButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  saveButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
