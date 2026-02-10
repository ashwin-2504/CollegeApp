export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type LectureType = 'Lecture' | 'Lab' | 'Tutorial' | 'Seminar' | 'Practical';

export interface LectureSlot {
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm in local time
  endTime: string; // HH:mm in local time
  subjectCode: string;
  subjectName: string;
  faculty: string;
  location: string;
  type: LectureType;
  batch?: string;
}

export interface TimetableSelection {
  className: string;
  division: string;
  batch?: string;
}

export interface TimetableSetupDraft {
  imageUri: string;
  selection: TimetableSelection;
  ocrText: string;
  parsedSlots: LectureSlot[];
  parseWarnings: string[];
}

export interface TimetableRecord {
  lockedAt: string;
  selection: TimetableSelection;
  slots: LectureSlot[];
}

export interface TimetableRuntimeResult {
  currentLecture: LectureSlot | null;
  nextLecture: LectureSlot | null;
}
