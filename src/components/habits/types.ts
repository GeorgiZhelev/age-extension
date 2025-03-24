export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // Array of ISO date strings
  streak: number;
  notCompletedDates: string[]; // Track explicit "not done" dates
}

export type ViewMode = 'regular' | 'calendar' | 'cumulative'; 