import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import DeadlineSelector from "@/components/DeadlineSelector";
import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { createTask } from "@/lib/domain/tasks";
import { type DeadlineIntent } from "@/lib/types";

function formatDateForDB(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatTimeForDB(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function CreateTaskScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;

  const [text, setText] = useState("");
  const [deadlineIntent, setDeadlineIntent] = useState<DeadlineIntent>("none");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      Alert.alert("Required", "Please enter a task description");
      return;
    }

    if (deadlineIntent === "time" && !time) {
      Alert.alert("Required", "Please select a time");
      return;
    }

    setSaving(true);
    try {
      await createTask(db, {
        text: trimmed,
        deadlineIntent,
        date: deadlineIntent !== "none" ? formatDateForDB(date) : null,
        time: deadlineIntent === "time" ? formatTimeForDB(time) : null,
        notes: notes.trim() || null,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      Alert.alert("Error", "Failed to save task");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const showDate = deadlineIntent === "date" || deadlineIntent === "time";
  const showTime = deadlineIntent === "time";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Task Text */}
        <View style={styles.field}>
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="What do you need to do?"
            placeholderTextColor={colors.textTertiary}
            value={text}
            onChangeText={setText}
            autoFocus
            multiline
            maxLength={500}
          />
        </View>

        {/* Deadline Intent */}
        <DeadlineSelector value={deadlineIntent} onChange={setDeadlineIntent} />

        {/* Date Picker */}
        {showDate && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Date
            </Text>
            <Pressable
              style={[
                styles.pickerButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.pickerText, { color: colors.text }]}>
                {date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (selectedDate) setDate(selectedDate);
                }}
                themeVariant="dark"
              />
            )}
          </View>
        )}

        {/* Time Picker */}
        {showTime && (
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Time
            </Text>
            <Pressable
              style={[
                styles.pickerButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.pickerText, { color: colors.text }]}>
                {time.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </Text>
            </Pressable>
            {showTimePicker && (
              <DateTimePicker
                value={time}
                mode="time"
                display="spinner"
                onChange={(_, selectedTime) => {
                  setShowTimePicker(Platform.OS === "ios");
                  if (selectedTime) setTime(selectedTime);
                }}
                themeVariant="dark"
              />
            )}
          </View>
        )}

        {/* Notes */}
        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            Notes (optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="Add any extra details..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={2000}
          />
        </View>

        {/* Save Button */}
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
            {saving ? "Saving..." : "Save Task"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  field: {
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginLeft: Spacing.xs,
  },
  textInput: {
    fontSize: FontSize.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 56,
    textAlignVertical: "top",
  },
  notesInput: {
    fontSize: FontSize.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: "top",
  },
  pickerButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: FontSize.md,
  },
  saveButton: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
