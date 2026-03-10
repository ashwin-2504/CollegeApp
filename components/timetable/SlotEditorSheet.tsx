import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
    Modal,
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
import type { DaySlot, SlotType } from "@/lib/timetable/builder/types";
import { formatTime } from "@/lib/timetable/engine";

interface SlotEditorSheetProps {
  slot: DaySlot;
  visible: boolean;
  onSave: (data: Partial<Omit<DaySlot, "id">>) => void;
  onClear: () => void;
  onRemove: () => void;
  onUnmerge: () => void;
  onClose: () => void;
  canUnmerge: boolean; // true if slot's time span is > base slot duration
}

function timeStringToDate(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function dateToTimeString(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function SlotEditorSheet({
  slot,
  visible,
  onSave,
  onClear,
  onRemove,
  onUnmerge,
  onClose,
  canUnmerge,
}: SlotEditorSheetProps) {
  const colors = Colors.dark;
  const [subjectName, setSubjectName] = useState(slot.subjectName);
  const [subjectCode, setSubjectCode] = useState(slot.subjectCode);
  const [faculty, setFaculty] = useState(slot.faculty);
  const [location, setLocation] = useState(slot.location);
  const [slotType, setSlotType] = useState<SlotType>(slot.type);
  const [startTime, setStartTime] = useState(timeStringToDate(slot.startTime));
  const [endTime, setEndTime] = useState(timeStringToDate(slot.endTime));
  const [activeTimePicker, setActiveTimePicker] = useState<
    "start" | "end" | null
  >(null);

  // Reset state when slot changes
  React.useEffect(() => {
    setSubjectName(slot.subjectName);
    setSubjectCode(slot.subjectCode);
    setFaculty(slot.faculty);
    setLocation(slot.location);
    setSlotType(slot.type);
    setStartTime(timeStringToDate(slot.startTime));
    setEndTime(timeStringToDate(slot.endTime));
    setActiveTimePicker(null);
  }, [slot.id]);

  const handleSave = () => {
    onSave({
      subjectName: subjectName.trim(),
      subjectCode: subjectCode.trim(),
      faculty: faculty.trim(),
      location: location.trim(),
      type: slotType,
      startTime: dateToTimeString(startTime),
      endTime: dateToTimeString(endTime),
    });
    onClose();
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
          {/* Handle bar */}
          <View style={styles.handleBar}>
            <View
              style={[styles.handle, { backgroundColor: colors.textTertiary }]}
            />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <FontAwesome
                name="times"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.form}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Subject Name */}
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
              value={subjectName}
              onChangeText={setSubjectName}
              autoFocus={!slot.subjectName}
            />

            {/* Subject Code + Location Row */}
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
                placeholder="Code"
                placeholderTextColor={colors.textTertiary}
                value={subjectCode}
                onChangeText={setSubjectCode}
                autoCapitalize="characters"
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
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Faculty */}
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
              value={faculty}
              onChangeText={setFaculty}
            />

            {/* Time pickers */}
            <View style={styles.row}>
              <Pressable
                style={[
                  styles.timeButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setActiveTimePicker("start")}
              >
                <Text
                  style={[styles.timeLabel, { color: colors.textSecondary }]}
                >
                  Start
                </Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {formatTime(dateToTimeString(startTime))}
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
                onPress={() => setActiveTimePicker("end")}
              >
                <Text
                  style={[styles.timeLabel, { color: colors.textSecondary }]}
                >
                  End
                </Text>
                <Text style={[styles.timeValue, { color: colors.text }]}>
                  {formatTime(dateToTimeString(endTime))}
                </Text>
              </Pressable>
            </View>

            {activeTimePicker && (
              <DateTimePicker
                value={activeTimePicker === "start" ? startTime : endTime}
                mode="time"
                display="spinner"
                onChange={(_, selected) => {
                  if (Platform.OS !== "ios") setActiveTimePicker(null);
                  if (selected) {
                    if (activeTimePicker === "start") setStartTime(selected);
                    else setEndTime(selected);
                  }
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
                        slotType === t
                          ? colors.primary + "20"
                          : colors.background,
                      borderColor:
                        slotType === t ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSlotType(t)}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      {
                        color:
                          slotType === t
                            ? colors.primary
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [
                  styles.saveButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Save Slot</Text>
              </Pressable>

              <View style={styles.secondaryActions}>
                {canUnmerge && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      {
                        borderColor: colors.border,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                    onPress={() => {
                      onUnmerge();
                      onClose();
                    }}
                  >
                    <FontAwesome
                      name="expand"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.secondaryText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Unmerge
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      borderColor: colors.border,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => {
                    onClear();
                    onClose();
                  }}
                >
                  <FontAwesome
                    name="eraser"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.secondaryText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Clear
                  </Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    {
                      borderColor: colors.danger + "40",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                  onPress={() => {
                    onRemove();
                    onClose();
                  }}
                >
                  <FontAwesome name="trash-o" size={12} color={colors.danger} />
                  <Text
                    style={[styles.secondaryText, { color: colors.danger }]}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
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
    maxHeight: "85%",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxl,
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
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  saveButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  secondaryText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});
