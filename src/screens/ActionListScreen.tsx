import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, layout, spacing, typography } from '../constants/theme';
import { ActionItem, ActionViewType } from '../types';
import { getActionsByView, completeAction } from '../database/actions';
import { ActionItemCard } from '../components/ActionItemCard';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react-native';

export const ActionListScreen = () => {
  const navigation = useNavigation();
  const [viewType, setViewType] = useState<ActionViewType>('UPCOMING');
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      // If viewType is NOW, we probably shouldn't be here if this screen is ONLY for Plan.
      // But let's support it if needed.
      // For this screen, we toggle between UPCOMING and UNSCHEDULED.
      const data = await getActionsByView(viewType);
      setActions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [viewType]);

  useFocusEffect(
    useCallback(() => {
      fetchActions();
    }, [fetchActions])
  );

  const handleToggleComplete = async (id: string) => {
    try {
        await completeAction(id);
        fetchActions();
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plan</Text>
        <Button size="sm" onPress={() => (navigation as any).navigate('AddAction')}>
            <Plus size={20} color={colors.primaryForeground} />
        </Button>
      </View>

      <View style={styles.tabs}>
        <Button 
            variant={viewType === 'UPCOMING' ? 'primary' : 'ghost'} 
            onPress={() => setViewType('UPCOMING')}
            size="sm"
            style={{ flex: 1 }}
        >
            Upcoming
        </Button>
        <Button 
            variant={viewType === 'UNSCHEDULED' ? 'primary' : 'ghost'} 
            onPress={() => setViewType('UNSCHEDULED')}
            size="sm"
            style={{ flex: 1 }}
        >
            Unscheduled
        </Button>
      </View>

      <FlatList
        data={actions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
            <ActionItemCard 
                item={item} 
                onToggleComplete={() => handleToggleComplete(item.id)}
            />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchActions} tintColor={colors.primary} />}
        ListEmptyComponent={
            !loading ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No tasks found</Text>
                </View>
            ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.m,
    paddingTop: spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    ...typography.h1,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.m,
    backgroundColor: colors.surface,
    padding: 4,
    borderRadius: layout.radius,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.caption,
  },
});
