// MVP: no tags, priorities, recurrence, hierarchy, or sync

export interface ActionItem {
  id: string;
  text: string;
  date: string | null; // YYYY-MM-DD or null
  time: string | null; // HH:MM or null
  notes: string | null;
  notificationId: string | null;
  createdAt: string; // ISO 8601
  completedAt: string | null; // ISO 8601 or null
}

export interface LectureSlot {
  id: string;
  dayOfWeek: number; // 0=Sunday..6=Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  subjectCode: string | null;
  subjectName: string;
  faculty: string | null;
  location: string | null;
  type: "THEORY" | "LAB" | "OTHER";
  batch: string | null;
}

export type DeadlineIntent = "none" | "date" | "time";

export interface CreateActionItemInput {
  text: string;
  deadlineIntent: DeadlineIntent;
  date: string | null; // YYYY-MM-DD
  time: string | null; // HH:MM
  notes: string | null;
}

export interface CreateLectureSlotInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectCode: string | null;
  subjectName: string;
  faculty: string | null;
  location: string | null;
  type: "THEORY" | "LAB" | "OTHER";
  batch: string | null;
}
