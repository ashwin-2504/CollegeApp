import { db } from "./db";
import { LectureSlot } from "../types";

export const saveTimetable = async (slots: LectureSlot[]) => {
  // Clear existing timetable? Spec says "Timetable is locked (read-only)" after setup.
  // Setup happens "once per semester". So replacing all is correct.
  await db.runAsync("DELETE FROM timetable");

  for (const slot of slots) {
    await db.runAsync(
      `INSERT INTO timetable (dayOfWeek, startTime, endTime, subjectCode, subjectName, faculty, location, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slot.dayOfWeek,
        slot.startTime,
        slot.endTime,
        slot.subjectCode,
        slot.subjectName,
        slot.faculty,
        slot.location,
        slot.type,
      ],
    );
  }
};

export const getTimetable = async (): Promise<LectureSlot[]> => {
  return await db.getAllAsync<LectureSlot>(
    "SELECT * FROM timetable ORDER BY dayOfWeek, startTime",
  );
};

export const getCurrentLecture = async (): Promise<LectureSlot | null> => {
  const now = new Date();
  const day = now.getDay();
  const time = now.toTimeString().slice(0, 5); // HH:MM

  const result = await db.getAllAsync<LectureSlot>(
    `SELECT * FROM timetable WHERE dayOfWeek = ? AND startTime <= ? AND endTime > ?`,
    [day, time, time],
  );

  return result[0] || null;
};

export const getNextLecture = async (): Promise<LectureSlot | null> => {
  const now = new Date();
  const day = now.getDay();
  const time = now.toTimeString().slice(0, 5); // HH:MM

  // Check for next lecture today
  const nextToday = await db.getAllAsync<LectureSlot>(
    `SELECT * FROM timetable WHERE dayOfWeek = ? AND startTime > ? ORDER BY startTime ASC LIMIT 1`,
    [day, time],
  );

  if (nextToday.length > 0) return nextToday[0];

  // Check for first lecture tomorrow
  // Logic: find next day with lectures.
  // Simple version: just check (day + 1) % 7.
  // Better: check next 7 days in order.

  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7;
    const firstNext = await db.getAllAsync<LectureSlot>(
      `SELECT * FROM timetable WHERE dayOfWeek = ? ORDER BY startTime ASC LIMIT 1`,
      [nextDay],
    );
    if (firstNext.length > 0) return firstNext[0];
  }

  return null;
};
