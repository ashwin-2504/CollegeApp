import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing, typography } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Calendar, Clock, Check, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createAction } from '../database/actions';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';

type DeadlineIntent = 'NONE' | 'DATE' | 'TIME';

export const AddActionScreen = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [notes, setNotes] = useState('');
  const [intent, setIntent] = useState<DeadlineIntent>('NONE');
  const [date, setDate] = useState(new Date());
  
  // For standard React Native DateTimePicker behavior (modal on iOS, dialog on Android)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (!text.trim()) return;

    let dateStr: string | undefined;
    let timeStr: string | undefined;

    if (intent === 'DATE' || intent === 'TIME') {
      dateStr = format(date, 'yyyy-MM-dd');
    }

    if (intent === 'TIME') {
      timeStr = format(date, 'HH:mm');
    }

    try {
      await createAction(text, dateStr, timeStr, notes);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to create action:', error);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(prev => {
        const newDate = new Date(selectedDate);
        // Preserve time if intent is TIME
        if (intent === 'TIME') {
            newDate.setHours(prev.getHours(), prev.getMinutes());
        }
        return newDate;
    });
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) setDate(prev => {
        const newDate = new Date(prev);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        return newDate;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
            <Text style={styles.title}>New Task</Text>
            <Button variant="ghost" onPress={() => navigation.goBack()} size="sm">
                <X size={24} color={colors.textMuted} />
            </Button>
        </View>

        <Input
          placeholder="What needs to be done?"
          value={text}
          onChangeText={setText}
          style={styles.mainInput}
          autoFocus
        />

        <Text style={styles.sectionLabel}>When is it due?</Text>
        <View style={styles.intentContainer}>
            <Button 
                variant={intent === 'NONE' ? 'primary' : 'secondary'} 
                onPress={() => setIntent('NONE')}
                style={styles.intentButton}
                size="sm"
            >
                No Deadline
            </Button>
            <Button 
                variant={intent === 'DATE' ? 'primary' : 'secondary'} 
                onPress={() => setIntent('DATE')}
                style={styles.intentButton}
                size="sm"
                leftIcon={<Calendar size={16} color={intent === 'DATE' ? colors.primaryForeground : colors.text} />}
            >
                By Date
            </Button>
            <Button 
                variant={intent === 'TIME' ? 'primary' : 'secondary'} 
                onPress={() => setIntent('TIME')}
                style={styles.intentButton}
                size="sm"
                leftIcon={<Clock size={16} color={intent === 'TIME' ? colors.primaryForeground : colors.text} />}
            >
                By Time
            </Button>
        </View>

        {(intent === 'DATE' || intent === 'TIME') && (
            <View style={styles.pickerContainer}>
                <View style={styles.dateDisplayRow}>
                    <Text style={styles.dateLabel}>Date</Text>
                    {Platform.OS === 'android' ? (
                        <Button variant="secondary" onPress={() => setShowDatePicker(true)}>
                            {format(date, 'EEE, MMM d, yyyy')}
                        </Button>
                    ) : (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            themeVariant="dark"
                        />
                    )}
                </View>
                {showDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}

                {intent === 'TIME' && (
                    <View style={styles.dateDisplayRow}>
                        <Text style={styles.dateLabel}>Time</Text>
                         {Platform.OS === 'android' ? (
                            <Button variant="secondary" onPress={() => setShowTimePicker(true)}>
                                {format(date, 'h:mm a')}
                            </Button>
                        ) : (
                             <DateTimePicker
                                value={date}
                                mode="time"
                                display="default"
                                onChange={onTimeChange}
                                themeVariant="dark"
                            />
                        )}
                    </View>
                )}
                {showTimePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={onTimeChange}
                    />
                )}
            </View>
        )}

        <Text style={styles.sectionLabel}>Additional Notes</Text>
        <Input
            placeholder="Any extra details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={{ height: 100, textAlignVertical: 'top' }}
        />

        <View style={styles.footer}>
            <Button onPress={handleSave} disabled={!text.trim()}>
                Create Task
            </Button>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    ...typography.h2,
  },
  mainInput: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: spacing.l,
  },
  sectionLabel: {
    ...typography.caption,
    marginBottom: spacing.s,
    marginLeft: spacing.xs,
  },
  intentContainer: {
    flexDirection: 'row',
    gap: spacing.s,
    marginBottom: spacing.l,
    flexWrap: 'wrap',
  },
  intentButton: {
    flex: 1,
    minWidth: '30%',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    padding: spacing.m,
    borderRadius: layout.radius,
    marginBottom: spacing.l,
    gap: spacing.m,
  },
  dateDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    ...typography.body,
    fontWeight: '500',
  },
  footer: {
    marginTop: spacing.xl,
  },
});
