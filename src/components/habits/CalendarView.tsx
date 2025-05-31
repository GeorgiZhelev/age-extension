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
    <div className="mt-2 overflow-y-auto pb-2">
      {/* Compact legend */}
      <div className="flex flex-wrap gap-1 mb-2">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${getHabitColor(habit.id)}`}></div>
            <span className="text-xs text-neutral-400">{habit.name}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
          <div key={idx} className="text-center text-xs text-neutral-500">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-0.5">
        {/* Adjust for Monday as first day of week */}
        {[...Array((startingDayOfWeek + 6) % 7)].map((_, i) => (
          <div key={`empty-${i}`} className="h-6"></div>
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
                h-6 p-0.5 bg-neutral-800 rounded flex flex-col justify-center
                ${isToday ? 'ring-1 ring-blue-400' : ''}
              `}
              title={date.toLocaleDateString()}
            >
              <div className="text-[8px] text-neutral-500 leading-none text-center">
                {date.getDate()}
              </div>
              
              <div className="flex gap-0.5 justify-center items-center mt-0.5">
                {habits.map((habit) => {
                  const isCompleted = habit.completedDates.includes(dateStr);
                  
                  // Only show dots for completed habits, not for not-completed ones
                  if (!isCompleted) return null;
                  
                  return (
                    <button
                      key={habit.id}
                      onClick={() => onToggleCompletion(habit.id, dateStr)}
                      className={`
                        w-1.5 h-1.5 rounded-full ${getHabitColor(habit.id)}
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