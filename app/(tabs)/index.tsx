import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import ActionItemCard from "@/components/ActionItemCard";
import EmptyState from "@/components/EmptyState";
import LectureCard from "@/components/LectureCard";
import {
    Colors,
    FontSize,
    FontWeight,
    Spacing
} from "@/lib/constants";
import { getNowTasks } from "@/lib/db/actionItems";
import { getLectureSlotsByDay } from "@/lib/db/lectureSlots";
import { toggleTaskComplete } from "@/lib/domain/tasks";
import { getCurrentLecture, getNextLecture } from "@/lib/timetable/engine";
import { type ActionItem, type LectureSlot } from "@/lib/types";

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function NowScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [currentLecture, setCurrentLecture] = useState<LectureSlot | null>(
    null,
  );
  const [nextLecture, setNextLecture] = useState<LectureSlot | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const now = new Date();
    const todayDate = getTodayDate();

    const [nowTasks, todaySlots] = await Promise.all([
      getNowTasks(db, todayDate),
      getLectureSlotsByDay(db, now.getDay()),
    ]);

    setTasks(nowTasks);
    setCurrentLecture(getCurrentLecture(todaySlots, now));
    setNextLecture(getNextLecture(todaySlots, now));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Refresh lecture context every minute
      const interval = setInterval(loadData, 60000);
      return () => clearInterval(interval);
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    await toggleTaskComplete(db, id);
    await loadData();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Lecture Context */}
      {(currentLecture || nextLecture) && (
        <View style={styles.lectureContext}>
          {currentLecture && (
            <LectureCard slot={currentLecture} variant="current" />
          )}
          {nextLecture && <LectureCard slot={nextLecture} variant="next" />}
        </View>
      )}

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Today's Tasks
        </Text>
        <Text style={[styles.taskCount, { color: colors.textTertiary }]}>
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {tasks.length === 0 && !currentLecture && !nextLecture ? (
        <>
          {renderHeader()}
          <EmptyState
            icon="bolt"
            title="Nothing right now"
            subtitle="Time-critical tasks for today will appear here"
          />
        </>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item, index }) => (
            <ActionItemCard
              item={item}
              index={index}
              onToggleComplete={handleToggle}
              onPress={(id) => router.push(`/task/${id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => router.push("/task/create")}
      >
        <FontAwesome name="plus" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Spacing.lg,
  },
  lectureContext: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  taskCount: {
    fontSize: FontSize.sm,
  },
  list: {
    paddingBottom: 100,
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#7C5CFC",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
