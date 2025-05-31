import React from 'react';
import { Habit } from './types';

interface HabitStatsProps {
  habits: Habit[];
}

const HabitStats: React.FC<HabitStatsProps> = ({ habits }) => {
  const today = new Date().toLocaleDateString('en-CA');
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  
  // Calculate weekly completion rate
  const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-CA'));
    }
    return dates;
  };
  
  const weekDates = getWeekDates();
  const weeklyCompletions = habits.reduce((sum, habit) => {
    const completedThisWeek = weekDates.filter(date => 
      habit.completedDates.includes(date)
    ).length;
    return sum + completedThisWeek;
  }, 0);
  
  const maxWeeklyCompletions = totalHabits * 7;
  const weeklyRate = maxWeeklyCompletions > 0 
    ? Math.round((weeklyCompletions / maxWeeklyCompletions) * 100) 
    : 0;
  
  return (
    <div className="flex justify-between items-center mb-2 px-1">
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-neutral-500">Today:</span>
          <span className={`font-medium ${completionRate === 100 ? 'text-green-400' : 'text-neutral-300'}`}>
            {completedToday}/{totalHabits}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-neutral-500">Week:</span>
          <span className="text-neutral-300 font-medium">{weeklyRate}%</span>
        </div>
      </div>
      {completionRate === 100 && (
        <span className="text-xs text-green-400">✨ All done!</span>
      )}
    </div>
  );
};

export default HabitStats;