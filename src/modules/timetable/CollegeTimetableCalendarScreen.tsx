import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ModuleShell } from '../../ui/components/ModuleShell';
import {
  getTimetableRecord,
  saveLockedTimetable,
} from './services/timetableStorage';
import { runOnDeviceOcrWithMlKit } from './services/mlKitOcr';
import { parseTimetableFromOcr } from './services/timetableParser';
import { resolveCurrentAndNextLecture } from './services/timetableResolver';
import { LectureSlot, TimetableRecord } from './types';

export function CollegeTimetableCalendarScreen() {
  const [record, setRecord] = useState<TimetableRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [className, setClassName] = useState('');
  const [division, setDivision] = useState('');
  const [batch, setBatch] = useState('');
  const [ocrText, setOcrText] = useState('');
  const [slots, setSlots] = useState<LectureSlot[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadRecord();
  }, []);

  const runtime = useMemo(() => {
    if (!record) {
      return { currentLecture: null, nextLecture: null };
    }

    return resolveCurrentAndNextLecture(record.slots);
  }, [record]);

  const hasSelection = className.trim().length > 0 && division.trim().length > 0;

  async function loadRecord() {
    setLoading(true);
    const existing = await getTimetableRecord();
    setRecord(existing);
    setLoading(false);
  }

  function clearDerivedDataOnImageChange(nextImageUri: string) {
    setImageUri(nextImageUri);
    setOcrText('');
    setSlots([]);
    setWarnings([]);
  }

  async function runOcrAndParse() {
    if (!imageUri) {
      Alert.alert('Missing image', 'Upload your timetable image before OCR.');
      return;
    }

    if (!hasSelection) {
      Alert.alert('Missing class info', 'Enter class and division before OCR.');
      return;
    }

    try {
      const rawText = await runOnDeviceOcrWithMlKit(imageUri);
      setOcrText(rawText);
      const parsed = parseTimetableFromOcr(rawText);
      setSlots(parsed.slots);
      setWarnings(parsed.warnings);
    } catch (error) {
      Alert.alert(
        'OCR unavailable',
        error instanceof Error
          ? error.message
          : 'Unable to run OCR with ML Kit.',
      );
    }
  }

  async function confirmAndLockTimetable() {
    if (slots.length === 0) {
      Alert.alert('No lectures parsed', 'Review OCR text and parse at least one slot.');
      return;
    }

    const nextRecord: TimetableRecord = {
      lockedAt: new Date().toISOString(),
      selection: {
        className: className.trim(),
        division: division.trim(),
        batch: batch.trim() || undefined,
      },
      slots,
    };

    await saveLockedTimetable(nextRecord);
    setRecord(nextRecord);
  }

  return (
    <ModuleShell
      title="College Timetable Calendar"
      subtitle="One-time setup via OCR, then timetable remains read-only offline."
    >
      {loading ? <Text style={styles.muted}>Loading timetable...</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Runtime lecture status</Text>
        <Text style={styles.cardBody}>{formatLecture('Current', runtime.currentLecture)}</Text>
        <Text style={styles.cardBody}>{formatLecture('Next', runtime.nextLecture)}</Text>
      </View>

      {record ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Locked timetable (read-only)</Text>
          <Text style={styles.cardBody}>
            Class {record.selection.className} · Division {record.selection.division}
            {record.selection.batch ? ` · Batch ${record.selection.batch}` : ''}
          </Text>
          <Text style={styles.muted}>Confirmed at {new Date(record.lockedAt).toLocaleString()}</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollCard} contentContainerStyle={styles.scrollCardContent}>
          <Text style={styles.cardTitle}>One-time setup</Text>
          <Text style={styles.stepTitle}>1) Upload timetable image</Text>
          <TextInput
            style={styles.input}
            value={imageUri ?? ''}
            onChangeText={clearDerivedDataOnImageChange}
            placeholder="Image URI (local file:// or content://)"
          />
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

          <Text style={styles.stepTitle}>2) Select class/division/batch</Text>
          <TextInput
            style={styles.input}
            value={className}
            onChangeText={setClassName}
            placeholder="Class (e.g., SE-IT)"
          />
          <TextInput
            style={styles.input}
            value={division}
            onChangeText={setDivision}
            placeholder="Division (e.g., A)"
          />
          <TextInput
            style={styles.input}
            value={batch}
            onChangeText={setBatch}
            placeholder="Batch (optional)"
          />

          <Text style={styles.stepTitle}>3) Run on-device OCR (ML Kit)</Text>
          <Button title="Run OCR and parse" onPress={runOcrAndParse} />

          <Text style={styles.stepTitle}>4) Review and confirm</Text>
          <Text style={styles.muted}>Parsed lectures: {slots.length}</Text>
          {warnings.length > 0 ? (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Parser warnings</Text>
              {warnings.map((warning) => (
                <Text key={warning} style={styles.warningText}>
                  • {warning}
                </Text>
              ))}
            </View>
          ) : null}

          {slots.map((slot, index) => (
            <Text key={`${slot.subjectCode}-${slot.dayOfWeek}-${index}`} style={styles.cardBody}>
              {slot.dayOfWeek} {slot.startTime}-{slot.endTime} · {slot.subjectCode} · {slot.subjectName}
            </Text>
          ))}

          <Button title="Confirm and lock timetable" onPress={confirmAndLockTimetable} />

          {ocrText ? (
            <View>
              <Text style={styles.stepTitle}>OCR raw text (for deterministic review)</Text>
              <Text style={styles.ocrText}>{ocrText}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
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
    gap: 8,
  },
  scrollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  scrollCardContent: {
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardBody: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  stepTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  muted: {
    fontSize: 13,
    color: '#64748b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
  },
  warningBox: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  warningTitle: {
    fontWeight: '700',
    color: '#9a3412',
    marginBottom: 4,
  },
  warningText: {
    color: '#9a3412',
    fontSize: 12,
  },
  ocrText: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#1e293b',
  },
});
