import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModuleShell } from '../../ui/components/ModuleShell';

export function CollegeTimetableCalendarScreen() {
  return (
    <ModuleShell
      title="College Timetable Calendar"
      subtitle="Keep your weekly class schedule available offline by default."
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <Text style={styles.cardBody}>
          Your timetable will appear here once classes are added.
        </Text>
      </View>
    </ModuleShell>
  );
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
