export interface ActionItem {
  id: string;
  text: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  notes?: string;
  createdAt: string; // ISO 8601
  completedAt?: string; // ISO 8601
  notificationId?: string;
}

export type ActionViewType = "NOW" | "UPCOMING" | "UNSCHEDULED";

export interface LectureSlot {
  id?: number; // Auto-increment ID for DB
  dayOfWeek: number; // 0 (Sunday) - 6 (Saturday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  subjectCode: string;
  subjectName: string;
  faculty: string;
  location: string;
  type: "THEORY" | "LAB" | "OTHER";
}
