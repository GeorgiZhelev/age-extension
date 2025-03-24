import { Habit } from './types';

// Calculate streak for a given set of dates
export const calculateStreak = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = [...dates].sort().reverse();
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // If today or yesterday isn't in the dates, streak is 0
  if (!dates.includes(today) && !dates.includes(yesterdayStr)) {
    return 0;
  }
  
  let streak = 1;
  let currentDate = new Date(sortedDates[0]);
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];
    
    if (sortedDates[i] === prevDateStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }
  
  return streak;
};

// Helper to format day name
export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

// Generate dates for the past 30 days
export const generatePast30Days = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Calculate cumulative completions for a habit
export const calculateCumulativeCompletions = (habit: Habit): { date: string; cumulative: number }[] => {
  const past30Days = generatePast30Days();
  let cumulative = 0;
  
  return past30Days.map(date => {
    if (habit.completedDates.includes(date)) {
      cumulative += 1;
    }
    return { date, cumulative };
  });
};

// Generate demo data for testing
export const generateDemoData = (probability: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    if (Math.random() < probability) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
}; 