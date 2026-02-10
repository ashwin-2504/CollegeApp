import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, layout, spacing, typography } from '../constants/theme';
import { ActionItem, LectureSlot } from '../types';
import { getActionsByView, completeAction } from '../database/actions';
import { getCurrentLecture, getNextLecture } from '../database/timetable';
import { updateTimetableNotification } from '../services/timetableNotifications';
import { ActionItemCard } from '../components/ActionItemCard';
import { Button } from '../components/ui/Button';
import { Plus, GraduationCap, MapPin, Clock } from 'lucide-react-native';
import { format } from 'date-fns';

export const HomeScreen = () => {
  const navigation = useNavigation();
  const [nowActions, setNowActions] = useState<ActionItem[]>([]);
  const [currentLecture, setCurrentLecture] = useState<LectureSlot | null>(null);
  const [nextLecture, setNextLecture] = useState<LectureSlot | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const actions = await getActionsByView('NOW');
      setNowActions(actions);
      
      const current = await getCurrentLecture();
      setCurrentLecture(current);
      
      const next = await getNextLecture();
      setNextLecture(next);
      
      // Update persistent notification
      await updateTimetableNotification(current, next);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
        fetchData();
        // Poll every minute for timetable updates
        const interval = setInterval(() => {
            fetchData();
        }, 60000);
        return () => clearInterval(interval);
    }, [fetchData])
  );

  const handleToggleComplete = async (id: string) => {
    try {
        await completeAction(id);
        fetchData();
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, MMMM do')}</Text>
        </View>
        <Button size="sm" onPress={() => (navigation as any).navigate('AddAction')}>
            <Plus size={20} color={colors.primaryForeground} />
        </Button>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.primary} />}
      >
        {/* Timetable Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Academic Context</Text>
            {currentLecture ? (
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Now Happening</Text>
                    <Text style={styles.subjectTitle}>{currentLecture.subjectName || currentLecture.subjectCode}</Text>
                    <View style={styles.metaRow}>
                        <Clock size={16} color={colors.textMuted} />
                        <Text style={styles.metaText}>{currentLecture.startTime} - {currentLecture.endTime}</Text>
                        <MapPin size={16} color={colors.textMuted} style={{ marginLeft: spacing.m }} />
                        <Text style={styles.metaText}>{currentLecture.location}</Text>
                    </View>
                </View>
            ) : nextLecture ? (
                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                     <Text style={styles.cardHeader}>Next Up</Text>
                     <Text style={styles.subjectTitle}>{nextLecture.subjectName || nextLecture.subjectCode}</Text>
                     <View style={styles.metaRow}>
                        <Clock size={16} color={colors.textMuted} />
                        <Text style={styles.metaText}>{nextLecture.startTime}</Text>
                        <MapPin size={16} color={colors.textMuted} style={{ marginLeft: spacing.m }} />
                        <Text style={styles.metaText}>{nextLecture.location}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.emptyState}>
                    <GraduationCap size={32} color={colors.textMuted} />
                    <Text style={styles.emptyText}>No classes right now</Text>
                    <Button variant="ghost" size="sm" onPress={() => (navigation as any).navigate('TimetableSetup')}>
                        Setup Timetable
                    </Button>
                </View>
            )}
        </View>

        {/* Now Tasks Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Now</Text>
            {nowActions.length > 0 ? (
                nowActions.map(item => (
                    <ActionItemCard 
                        key={item.id} 
                        item={item} 
                        onToggleComplete={() => handleToggleComplete(item.id)}
                    />
                ))
            ) : (
                <View style={styles.card}>
                    <Text style={styles.emptyText}>No time-critical tasks for today.</Text>
                </View>
            )}
        </View>
      </ScrollView>
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
    marginBottom: spacing.l,
    marginTop: spacing.s,
  },
  greeting: {
    ...typography.h2,
  },
  date: {
    ...typography.caption,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.m,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.l,
    borderRadius: layout.radius,
    marginBottom: spacing.s,
  },
  cardHeader: {
    ...typography.caption,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subjectTitle: {
    ...typography.h3,
    marginBottom: spacing.s,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.body,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    gap: spacing.s,
  },
  emptyText: {
    ...typography.caption,
  },
});
