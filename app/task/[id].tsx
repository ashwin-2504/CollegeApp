import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { getActionItemById } from "@/lib/db/actionItems";
import { deleteTask, toggleTaskComplete } from "@/lib/domain/tasks";
import { formatTime } from "@/lib/timetable/engine";
import { type ActionItem } from "@/lib/types";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;
  const [task, setTask] = useState<ActionItem | null>(null);

  const loadTask = useCallback(async () => {
    if (!id) return;
    const item = await getActionItemById(db, id);
    setTask(item);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      loadTask();
    }, [loadTask]),
  );

  const handleToggle = async () => {
    if (!task) return;
    await toggleTaskComplete(db, task.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await loadTask();
  };

  const handleDelete = () => {
    Alert.alert("Delete Task", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!task) return;
          await deleteTask(db, task.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.back();
        },
      },
    ]);
  };

  if (!task) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.textSecondary }]}>
          Task not found
        </Text>
      </View>
    );
  }

  const isCompleted = !!task.completedAt;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        {/* Status */}
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isCompleted
                ? colors.success + "15"
                : colors.primary + "15",
            },
          ]}
        >
          <FontAwesome
            name={isCompleted ? "check-circle" : "circle-o"}
            size={14}
            color={isCompleted ? colors.success : colors.primary}
          />
          <Text
            style={[
              styles.statusText,
              {
                color: isCompleted ? colors.success : colors.primary,
              },
            ]}
          >
            {isCompleted ? "Completed" : "Active"}
          </Text>
        </View>

        {/* Task Text */}
        <Text style={[styles.taskText, { color: colors.text }]}>
          {task.text}
        </Text>

        {/* Details */}
        <View style={styles.details}>
          {task.date && (
            <View style={styles.detailRow}>
              <FontAwesome
                name="calendar"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Date
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(task.date)}
              </Text>
            </View>
          )}
          {task.time && (
            <View style={styles.detailRow}>
              <FontAwesome
                name="clock-o"
                size={14}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.detailLabel, { color: colors.textSecondary }]}
              >
                Time
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatTime(task.time)}
              </Text>
            </View>
          )}
          {task.notes && (
            <View style={styles.notesSection}>
              <Text
                style={[styles.notesLabel, { color: colors.textSecondary }]}
              >
                Notes
              </Text>
              <View
                style={[
                  styles.notesBox,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.notesText, { color: colors.text }]}>
                  {task.notes}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: isCompleted
                  ? colors.surfaceElevated
                  : colors.success + "15",
                borderColor: isCompleted
                  ? colors.border
                  : colors.success + "30",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleToggle}
          >
            <FontAwesome
              name={isCompleted ? "undo" : "check"}
              size={16}
              color={isCompleted ? colors.textSecondary : colors.success}
            />
            <Text
              style={[
                styles.actionText,
                {
                  color: isCompleted ? colors.textSecondary : colors.success,
                },
              ]}
            >
              {isCompleted ? "Mark Incomplete" : "Mark Complete"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.danger + "10",
                borderColor: colors.danger + "25",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={handleDelete}
          >
            <FontAwesome name="trash" size={16} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>
              Delete
            </Text>
          </Pressable>
        </View>

        {/* Meta */}
        <Text style={[styles.meta, { color: colors.textTertiary }]}>
          Created{" "}
          {new Date(task.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  notFound: {
    textAlign: "center",
    marginTop: 80,
    fontSize: FontSize.lg,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  taskText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: 32,
  },
  details: {
    gap: Spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: FontSize.sm,
    width: 40,
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  notesSection: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  notesLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  notesBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  notesText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  meta: {
    fontSize: FontSize.xs,
    textAlign: "center",
  },
});
