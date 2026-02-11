import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import React, { useCallback, useState } from "react";
import {
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    View,
} from "react-native";

import ActionItemCard from "@/components/ActionItemCard";
import EmptyState from "@/components/EmptyState";
import { Colors, Spacing } from "@/lib/constants";
import { getUnscheduledTasks } from "@/lib/db/actionItems";
import { toggleTaskComplete } from "@/lib/domain/tasks";
import { type ActionItem } from "@/lib/types";

export default function UnscheduledScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const colors = Colors.dark;
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const items = await getUnscheduledTasks(db);
    setTasks(items);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {tasks.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="Inbox is empty"
          subtitle="Tasks without deadlines go here — quick notes, ideas, and reminders"
        />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
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
  list: {
    paddingTop: Spacing.lg,
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
