import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
    Pressable,
    RefreshControl,
    SectionList,
    StyleSheet,
    Text,
    View,
} from "react-native";

import ActionItemCard from "@/components/ActionItemCard";
import EmptyState from "@/components/EmptyState";
import { Colors, FontSize, FontWeight, Spacing } from "@/lib/constants";
import { getUpcomingTasks } from "@/lib/db/actionItems";
import { toggleTaskComplete } from "@/lib/domain/tasks";
import { type ActionItem } from "@/lib/types";

interface Section {
  title: string;
  data: ActionItem[];
}

function formatSectionTitle(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupByDate(tasks: ActionItem[]): Section[] {
  const groups: Record<string, ActionItem[]> = {};
  for (const task of tasks) {
    const key = task.date!;
    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  }
  return Object.entries(groups).map(([date, data]) => ({
    title: formatSectionTitle(date),
    data,
  }));
}

export default function UpcomingScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;
  const [sections, setSections] = useState<Section[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const tasks = await getUpcomingTasks(db);
    setSections(groupByDate(tasks));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
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

  if (sections.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="calendar"
          title="No upcoming tasks"
          subtitle="Tasks with date deadlines will appear here, grouped by date"
        />
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View
            style={[
              styles.sectionHeader,
              { backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
              {section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => (
          <ActionItemCard
            item={item}
            index={index}
            onToggleComplete={handleToggle}
            onPress={(id) => router.push(`/task/${id}`)}
          />
        )}
        stickySectionHeadersEnabled
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  sectionCount: {
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
