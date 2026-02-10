// import TextRecognition from 'react-native-mlkit-ocr';
import { LectureSlot } from "../types";

// Mock OCR for Expo Go (Standard Client doesn't support ML Kit)
export const recognizeTimetable = async (
  imageUri: string,
): Promise<string[]> => {
  console.log("Mock OCR processing image:", imageUri);
  // Simulate network/processing delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return sample text lines representing timetable data
  return [
    "Mon 09:00 - 10:00 CS101 Lecture Room 101",
    "Tue 11:00 - 12:30 PHY102 Lab Room 204",
    "Wed 14:00 - 15:30 MTH103 Tutorial Room 305",
    "Thu 10:00 - 11:30 ENG101 Lecture Room 202",
    "Fri 13:00 - 14:30 CHE102 Lab Room 301",
  ];
};

// Heuristic parser (MVP Rule-based)
export const parseTimetableText = (textBlocks: string[]): LectureSlot[] => {
  // Return empty array for now since we are manually editing in the UI anyway,
  // or return recognized slots if we want to mock that too.
  // The previous implementation was empty.
  const slots: LectureSlot[] = [];

  // Simple mock parser: if the block starts with a Day (Mon-Fri), try to extract time.
  // This is just to demonstrate the logic flow.
  // Since we are returning hardcoded strings above, let's parse them!
  const dayMap: { [key: string]: number } = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };

  textBlocks.forEach((block) => {
    const parts = block.split(" ");
    if (dayMap[parts[0]]) {
      // E.g. "Mon 09:00 - 10:00 CS101 Lecture Room 101"
      // parts: [Mon, 09:00, -, 10:00, CS101, Lecture, Room, 101]
      // Very brittle, but works for mock testing.
      if (parts.length >= 8) {
        slots.push({
          dayOfWeek: dayMap[parts[0]],
          startTime: parts[1],
          endTime: parts[3],
          subjectCode: parts[4],
          subjectName: parts[5], // Just grabbing 'Lecture'
          faculty: "TBD",
          location: parts.slice(6).join(" "), // Room 101
          type: "THEORY",
        });
      }
    }
  });

  return slots;
};
