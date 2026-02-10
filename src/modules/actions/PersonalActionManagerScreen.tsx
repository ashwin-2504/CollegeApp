import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ModuleShell } from '../../ui/components/ModuleShell';
import { createActionItem, listActionItems } from '../../storage';
import {
  formatFriendlyDate,
  getTodayDateString,
  selectNowItems,
  selectUnscheduledItems,
  selectUpcomingGroups,
} from './selectors';
import { ActionItem, DeadlineIntent } from './types';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

function createActionItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function PersonalActionManagerScreen() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskText, setTaskText] = useState('');
  const [deadlineIntent, setDeadlineIntent] = useState<DeadlineIntent>('none');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);

  const nowItems = useMemo(() => selectNowItems(items), [items]);
  const upcomingGroups = useMemo(() => selectUpcomingGroups(items), [items]);
  const unscheduledItems = useMemo(() => selectUnscheduledItems(items), [items]);

  useEffect(() => {
    const hydrateItems = async () => {
      const storedItems = await listActionItems();
      setItems(storedItems);
      setLoading(false);
    };

    hydrateItems();
  }, []);

  const handleIntentChange = (intent: DeadlineIntent) => {
    setDeadlineIntent(intent);
    setDateError(null);

    if (intent === 'none') {
      setDateInput('');
      setTimeInput('');
      return;
    }

    if (intent === 'date') {
      setTimeInput('');
    }

    if (intent === 'time') {
      if (!datePattern.test(dateInput)) {
        setDateInput(getTodayDateString());
      }
    }
  };

  const handleCreateTask = async () => {
    const text = taskText.trim();
    const notes = notesInput.trim();

    if (!text) {
      setTaskError('Task text is required.');
      return;
    }

    setTaskError(null);

    const itemDate =
      deadlineIntent === 'none'
        ? undefined
        : datePattern.test(dateInput)
          ? dateInput
          : undefined;

    if (deadlineIntent === 'date' && dateInput && !itemDate) {
      setDateError('Use YYYY-MM-DD for date.');
      return;
    }

    if (deadlineIntent === 'time' && !timePattern.test(timeInput)) {
      Alert.alert('Time required', 'Please provide time in HH:MM format.');
      return;
    }

    const resolvedDate =
      deadlineIntent === 'time' ? itemDate ?? getTodayDateString() : itemDate;

    const newItem: ActionItem = {
      id: createActionItemId(),
      text,
      date: resolvedDate,
      time: deadlineIntent === 'time' ? timeInput : undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    await createActionItem(newItem);
    setItems((current) => [...current, newItem]);
    setTaskText('');
    setNotesInput('');
    setDeadlineIntent('none');
    setDateInput('');
    setTimeInput('');
    setDateError(null);
  };

  return (
    <ModuleShell
      title="Personal Action Manager"
      subtitle="Capture action items with optional scheduling details."
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {loading ? <Text style={styles.placeholderText}>Loading saved tasks...</Text> : null}
          <Text style={styles.sectionTitle}>Create Task</Text>
          <Text style={styles.label}>Task text *</Text>
          <TextInput
            style={styles.input}
            value={taskText}
            onChangeText={(value) => {
              setTaskText(value);
              if (value.trim()) {
                setTaskError(null);
              }
            }}
            placeholder="What do you need to do?"
          />
          {taskError ? <Text style={styles.errorText}>{taskError}</Text> : null}

          <Text style={styles.label}>Deadline intent</Text>
          <View style={styles.intentRow}>
            {(['none', 'date', 'time'] as DeadlineIntent[]).map((intent) => (
              <Pressable
                key={intent}
                onPress={() => handleIntentChange(intent)}
                style={[
                  styles.intentButton,
                  deadlineIntent === intent && styles.intentButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.intentText,
                    deadlineIntent === intent && styles.intentTextActive,
                  ]}
                >
                  {intent[0].toUpperCase() + intent.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {deadlineIntent !== 'none' ? (
            <>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dateInput}
                onChangeText={(value) => {
                  setDateInput(value);
                  if (datePattern.test(value)) {
                    setDateError(null);
                  }
                }}
                placeholder="2026-02-10"
              />
              {dateError ? <Text style={styles.errorText}>{dateError}</Text> : null}
            </>
          ) : null}

          {deadlineIntent === 'time' ? (
            <>
              <Text style={styles.label}>Time (HH:MM) *</Text>
              <TextInput
                style={styles.input}
                value={timeInput}
                onChangeText={setTimeInput}
                placeholder="09:30"
              />
            </>
          ) : null}

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notesInput}
            onChangeText={setNotesInput}
            multiline
            placeholder="Any additional details"
          />

          <Pressable style={styles.createButton} onPress={handleCreateTask}>
            <Text style={styles.createButtonText}>Add Action Item</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Now</Text>
          {nowItems.length ? (
            nowItems.map((item) => (
              <Text key={item.id} style={styles.itemText}>{`• ${item.time} ${item.text}`}</Text>
            ))
          ) : (
            <Text style={styles.placeholderText}>No time-based tasks scheduled for today.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {upcomingGroups.length ? (
            upcomingGroups.map((group) => (
              <View key={group.date} style={styles.groupBlock}>
                <Text style={styles.groupHeading}>{formatFriendlyDate(group.date)}</Text>
                {group.items.map((item) => (
                  <Text key={item.id} style={styles.itemText}>{`• ${item.text}`}</Text>
                ))}
              </View>
            ))
          ) : (
            <Text style={styles.placeholderText}>No date-only tasks scheduled.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Unscheduled</Text>
          {unscheduledItems.length ? (
            unscheduledItems.map((item) => (
              <Text key={item.id} style={styles.itemText}>{`• ${item.text}`}</Text>
            ))
          ) : (
            <Text style={styles.placeholderText}>No unscheduled tasks.</Text>
          )}
        </View>
      </ScrollView>
    </ModuleShell>
  );
}


const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 20,
  },
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  intentRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  intentButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  intentButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  intentText: {
    color: '#334155',
    fontWeight: '600',
  },
  intentTextActive: {
    color: '#1d4ed8',
  },
  createButton: {
    marginTop: 14,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  errorText: {
    color: '#b91c1c',
    marginTop: 4,
    fontSize: 12,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 14,
  },
  groupBlock: {
    marginBottom: 10,
  },
  groupHeading: {
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemText: {
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 2,
  },
});
