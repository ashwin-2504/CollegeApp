import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ModuleShell } from '../../ui/components/ModuleShell';

export function PersonalActionManagerScreen() {
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
