export type ActionItem = {
  id: string;
  text: string;
  date?: string;
  time?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
};

export type DeadlineIntent = 'none' | 'date' | 'time';
