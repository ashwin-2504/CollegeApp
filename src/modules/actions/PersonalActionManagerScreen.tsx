import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModuleShell } from '../../ui/components/ModuleShell';
import { getTimetableRuntimeSnapshot } from '../timetable/services/timetableRuntime';
import { LectureSlot } from '../timetable/types';

export function PersonalActionManagerScreen() {
  const [currentLecture, setCurrentLecture] = useState<LectureSlot | null>(null);
  const [nextLecture, setNextLecture] = useState<LectureSlot | null>(null);

  useEffect(() => {
    const load = async () => {
      const runtime = await getTimetableRuntimeSnapshot();
      setCurrentLecture(runtime.currentLecture);
      setNextLecture(runtime.nextLecture);
    };

    load();
  }, []);

  return (
    <ModuleShell
      title="Personal Action Manager"
      subtitle="Capture, prioritize, and review actions even when offline."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today</Text>
        <Text style={styles.cardBody}>
          Add your first action item to start building momentum.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lecture snapshot</Text>
        <Text style={styles.cardBody}>{formatLecture('Current', currentLecture)}</Text>
        <Text style={styles.cardBody}>{formatLecture('Next', nextLecture)}</Text>
      </View>
    </ModuleShell>
  );
}

function formatLecture(label: string, slot: LectureSlot | null): string {
  if (!slot) {
    return `${label}: None`;
  }

  return `${label}: ${slot.subjectCode} ${slot.subjectName} (${slot.startTime}-${slot.endTime})`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
});
