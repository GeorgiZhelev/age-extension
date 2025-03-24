import { Habit } from './types';

// Generate a consistent and distinct color for each habit
export const getHabitColor = (habits: Habit[], habitId: string): string => {
  // Predefined set of visually distinct colors
  const colors = [
    'bg-green-500',   // Bright green
    'bg-pink-500',    // Pink
    'bg-blue-500',    // Blue 
    'bg-amber-500',   // Amber
    'bg-purple-500',  // Purple
    'bg-cyan-500',    // Cyan
    'bg-rose-500',    // Rose
    'bg-indigo-500',  // Indigo
    'bg-lime-500',    // Lime
  ];
  
  // Find the habit's index in the habits array for consistent color assignment
  const habitIndex = habits.findIndex(h => h.id === habitId);
  return colors[habitIndex % colors.length];
};

// Get streak color based on the streak count
export const getStreakColor = (streak: number): string => {
  // Basic progression
  if (streak === 0) return 'text-red-500';
  if (streak === 1) return 'text-orange-500';
  if (streak < 5) return 'text-green-400';
  
  // Milestone colors - create a "rainbow" progression
  if (streak < 10) return 'text-green-500';
  if (streak < 20) return 'text-teal-500';
  if (streak < 30) return 'text-cyan-500';
  if (streak < 50) return 'text-blue-500';
  if (streak < 70) return 'text-indigo-500';
  if (streak < 90) return 'text-purple-500';
  if (streak < 100) return 'text-pink-500';
  
  // Special rainbow effect for 100+
  return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 font-bold';
}; 