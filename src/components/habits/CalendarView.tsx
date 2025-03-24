import React from 'react';
import { Habit } from './types';
import { generatePast30Days } from './utils';

interface CalendarViewProps {
  habits: Habit[];
  getHabitColor: (habitId: string) => string;
  onToggleCompletion: (id: string, dateStr: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  habits,
  getHabitColor,
  onToggleCompletion
}) => {
  const past30Days = generatePast30Days();
  const firstDay = new Date(past30Days[0]);
  const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  return (
    <div className="mt-4 overflow-y-auto pb-4">
      {/* Centered title */}
      <h3 className="text-sm font-medium text-neutral-300 mb-3 text-center">
        All Habits - Past 30 Days
      </h3>
      
      {/* Color legend as a horizontal list */}
      <div className="flex flex-wrap gap-2 justify-center mb-3">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${getHabitColor(habit.id)}`}></div>
            <span className="text-xs text-neutral-300">{habit.name}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-0.75 mb-1.5">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs text-neutral-400">
            {day}
          </div>
        ))}
      </div>
      
      {/* Add px-1 to fix the border clipping issue */}
      <div className="grid grid-cols-7 gap-0.75 px-1">
        {/* Adjust for Monday as first day of week */}
        {[...Array((startingDayOfWeek + 6) % 7)].map((_, i) => (
          <div key={`empty-${i}`} className="h-8"></div>
        ))}
        
        {past30Days.map((dateStr) => {
          const date = new Date(dateStr);
          const today = new Date();
          const isToday = date.getDate() === today.getDate() && 
                          date.getMonth() === today.getMonth() && 
                          date.getFullYear() === today.getFullYear();
          
          return (
            <div
              key={dateStr}
              className={`
                h-8 p-1 bg-neutral-800 rounded flex flex-col
                ${isToday ? 'ring-1 ring-blue-400' : ''}
              `}
              title={date.toLocaleDateString()}
            >
              <div className="text-[9px] text-neutral-400 leading-tight text-center">
                {date.getDate()}
              </div>
              
              <div className="flex flex-wrap gap-0.75 justify-center items-center mt-0.5">
                {habits.map((habit) => {
                  const isCompleted = habit.completedDates.includes(dateStr);
                  
                  // Only show dots for completed habits, not for not-completed ones
                  if (!isCompleted) return null;
                  
                  return (
                    <button
                      key={habit.id}
                      onClick={() => onToggleCompletion(habit.id, dateStr)}
                      className={`
                        w-2 h-2 rounded-full ${getHabitColor(habit.id)}
                      `}
                      title={`${habit.name}: Completed`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView; 