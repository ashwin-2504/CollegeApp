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

import EmptyState from "@/components/EmptyState";
import LectureCard from "@/components/LectureCard";
import {
    BorderRadius,
    Colors,
    FontSize,
    FontWeight,
    Spacing,
} from "@/lib/constants";
import { getLectureSlotsByDay, hasLectureSlots } from "@/lib/db/lectureSlots";
import {
    DAY_NAMES,
    getCurrentLecture,
    getNextLecture,
    getTodaySchedule,
} from "@/lib/timetable/engine";
import { type LectureSlot } from "@/lib/types";

export default function TimetableScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;
  const [schedule, setSchedule] = useState<LectureSlot[]>([]);
  const [current, setCurrent] = useState<LectureSlot | null>(null);
  const [next, setNext] = useState<LectureSlot | null>(null);
  const [hasSetup, setHasSetup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const now = new Date();
    const setupDone = await hasLectureSlots(db);
    setHasSetup(setupDone);

    if (setupDone) {
      const todaySlots = await getLectureSlotsByDay(db, now.getDay());
      setSchedule(getTodaySchedule(todaySlots, now));
      setCurrent(getCurrentLecture(todaySlots, now));
      setNext(getNextLecture(todaySlots, now));
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      const interval = setInterval(loadData, 60000);
      return () => clearInterval(interval);
    }, [loadData]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];

  if (!hasSetup) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="book"
          title="No timetable set up"
          subtitle="Add your college timetable to see your lectures here"
        />
        <Pressable
          style={({ pressed }) => [
            styles.setupButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push("/timetable/setup")}
        >
          <FontAwesome name="plus" size={16} color="#fff" />
          <Text style={styles.setupButtonText}>Set Up Timetable</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={schedule}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.dayTitle, { color: colors.text }]}>
              {dayName}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {schedule.length} {schedule.length === 1 ? "lecture" : "lectures"}{" "}
              today
            </Text>

            {/* Current + Next lecture highlights */}
            {(current || next) && (
              <View style={styles.highlights}>
                {current && <LectureCard slot={current} variant="current" />}
                {next && <LectureCard slot={next} variant="next" />}
              </View>
            )}

            {schedule.length > 0 && (
              <Text
                style={[styles.scheduleTitle, { color: colors.textSecondary }]}
              >
                Full Schedule
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.scheduleItem}>
            <LectureCard slot={item} variant="schedule" />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="moon-o"
            title="No classes today"
            subtitle={`Enjoy your ${dayName}!`}
          />
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />

      <Pressable
        style={({ pressed }) => [
          styles.editButton,
          {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
        onPress={() => router.push("/timetable/setup")}
      >
        <FontAwesome name="pencil" size={16} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  dayTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  subtitle: {
    fontSize: FontSize.sm,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  highlights: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  scheduleTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  scheduleItem: {
    paddingHorizontal: Spacing.lg,
  },
  list: {
    paddingBottom: 100,
  },
  setupButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    position: "absolute",
    bottom: 40,
  },
  setupButtonText: {
    color: "#fff",
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  editButton: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
