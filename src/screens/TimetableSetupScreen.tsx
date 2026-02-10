import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing, typography } from '../constants/theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Upload, X, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { recognizeTimetable, parseTimetableText } from '../services/ocr';
import { LectureSlot } from '../types';
import { saveTimetable } from '../database/timetable';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';

// A simple editable list for timetable slots
const SlotEditor = ({ slot, onUpdate, onDelete }: { slot: LectureSlot, onUpdate: (s: LectureSlot) => void, onDelete: () => void }) => {
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleTimeChange = (type: 'start' | 'end', event: any, date?: Date) => {
        if (type === 'start') setShowStartPicker(false);
        else setShowEndPicker(false);

        if (date) {
            onUpdate({ ...slot, [type === 'start' ? 'startTime' : 'endTime']: format(date, 'HH:mm') });
        }
    };

    return (
        <View style={styles.slotCard}>
            <View style={styles.slotHeader}>
                <Text style={styles.slotDay}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][slot.dayOfWeek]}</Text>
                <Button variant="ghost" size="sm" onPress={onDelete}>
                    <X size={16} color={colors.textMuted} />
                </Button>
            </View>
            <View style={styles.row}>
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onPress={() => setShowStartPicker(true)}
                    style={{ flex: 1, marginRight: 4 }}
                >
                    {slot.startTime}
                </Button>
                <Text style={{ color: colors.textMuted }}>-</Text>
                <Button 
                    variant="secondary" 
                    size="sm" 
                    onPress={() => setShowEndPicker(true)}
                    style={{ flex: 1, marginLeft: 4 }}
                >
                    {slot.endTime}
                </Button>
            </View>
            {showStartPicker && (
                <DateTimePicker 
                    value={new Date(`2000-01-01T${slot.startTime}:00`)} 
                    mode="time" 
                    onChange={(e: any, d?: Date) => handleTimeChange('start', e, d)} 
                />
            )}
            {showEndPicker && (
                <DateTimePicker 
                    value={new Date(`2000-01-01T${slot.endTime}:00`)} 
                    mode="time" 
                    onChange={(e: any, d?: Date) => handleTimeChange('end', e, d)} 
                />
            )}

            <Input 
                placeholder="Subject (e.g. CS101)" 
                value={slot.subjectName} 
                onChangeText={(t) => onUpdate({ ...slot, subjectName: t })} 
                style={{ marginTop: spacing.s, marginBottom: spacing.xs }}
            />
             <Input 
                placeholder="Location (e.g. 204)" 
                value={slot.location} 
                onChangeText={(t) => onUpdate({ ...slot, location: t })} 
                style={{ marginBottom: 0 }}
            />
        </View>
    );
};

export const TimetableSetupScreen = () => {
    const navigation = useNavigation();
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'upload' | 'review'>('upload');
    const [slots, setSlots] = useState<LectureSlot[]>([]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const processImage = async () => {
        if (!image) return;
        setLoading(true);
        try {
            // Wait, recognizeTimetable calls native code. 
            // In Expo Go, this will fail. We need a fallback or check.
            // For this implementation, we assume a build. 
            // If it fails, we fall back to manual entry.
            const textBlocks = await recognizeTimetable(image);
            const parsedSlots = parseTimetableText(textBlocks);
            
            if (parsedSlots.length === 0) {
                Alert.alert("OCR Result", "No specific slots detected. Please add them manually.");
                // Add a default empty slot to start
                setSlots([{ 
                    dayOfWeek: 1, startTime: '09:00', endTime: '10:00', 
                    subjectCode: '', subjectName: '', faculty: '', location: '', type: 'THEORY' 
                }]);
            } else {
                setSlots(parsedSlots);
            }
            setStep('review');
        } catch (error) {
            Alert.alert("Error", "OCR failed. Please enter manually.");
            setStep('review');
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await saveTimetable(slots);
            navigation.goBack();
        } catch {
            Alert.alert("Error", "Failed to save timetable");
        } finally {
            setLoading(false);
        }
    };

    const addSlot = () => {
        setSlots(prev => [...prev, {
            dayOfWeek: 1, startTime: '09:00', endTime: '10:00', 
            subjectCode: '', subjectName: '', faculty: '', location: '', type: 'THEORY'
        }]);
    };

    const updateSlot = (index: number, updated: LectureSlot) => {
        const newSlots = [...slots];
        newSlots[index] = updated;
        setSlots(newSlots);
    };

    const deleteSlot = (index: number) => {
        const newSlots = slots.filter((_, i) => i !== index);
        setSlots(newSlots);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Setup Timetable</Text>
                {step === 'upload' && (
                     <Button variant="ghost" onPress={() => navigation.goBack()} size="sm">
                        <X size={24} color={colors.textMuted} />
                    </Button>
                )}
            </View>

            {step === 'upload' ? (
                <View style={styles.uploadContainer}>
                    {image ? (
                         <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
                    ) : (
                        <View style={styles.placeholder}>
                            <Upload size={48} color={colors.textMuted} />
                            <Text style={styles.placeholderText}>Upload Timetable Image</Text>
                        </View>
                    )}
                    
                    <View style={styles.buttonRow}>
                        <Button onPress={pickImage} variant="secondary">
                            Pick Image
                        </Button>
                        <Button onPress={processImage} disabled={!image || loading}>
                            {loading ? <ActivityIndicator color={colors.primaryForeground} /> : "Process"}
                        </Button>
                    </View>
                    <Button variant="ghost" onPress={() => setStep('review')} style={{ marginTop: spacing.m }}>
                        Skip to Manual Entry
                    </Button>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                     <ScrollView contentContainerStyle={styles.listContent}>
                        {slots.map((slot, index) => (
                            <SlotEditor 
                                key={index} 
                                slot={slot} 
                                onUpdate={(s) => updateSlot(index, s)} 
                                onDelete={() => deleteSlot(index)} 
                            />
                        ))}
                        <Button variant="secondary" onPress={addSlot} leftIcon={<Plus size={16} color={colors.text} />}>
                            Add Class
                        </Button>
                    </ScrollView>
                    <View style={styles.footer}>
                         <Button onPress={handleSave} loading={loading}>
                            Confirm & Save
                        </Button>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
    uploadContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: layout.radius,
        marginBottom: spacing.l,
    },
    placeholder: {
        width: '100%',
        height: 200,
        backgroundColor: colors.surface,
        borderRadius: layout.radius,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.l,
        borderWidth: 2,
        borderColor: colors.border, // Need to define or use colors.border
        borderStyle: 'dashed',
    },
    placeholderText: {
        ...typography.body,
        color: colors.textMuted,
        marginTop: spacing.s,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.m,
    },
    listContent: {
        paddingBottom: 80,
    },
    slotCard: {
        backgroundColor: colors.surface,
        padding: spacing.m,
        borderRadius: layout.radius,
        marginBottom: spacing.m,
    },
    slotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    slotDay: {
        ...typography.h3,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.s,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.m,
        left: spacing.m,
        right: spacing.m,
    },
});
