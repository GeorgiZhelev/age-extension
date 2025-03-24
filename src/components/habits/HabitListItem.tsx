import React, { useState } from 'react';
import { Habit } from './types';
import { getDayName } from './utils';
import { getStreakColor } from './styles';

interface HabitListItemProps {
  habit: Habit;
  onToggleCompletion: (id: string, dateStr: string) => void;
  onEdit: (habit: Habit, newName: string) => void;
  onDelete: (id: string) => void;
}

const HabitListItem: React.FC<HabitListItemProps> = ({
  habit,
  onToggleCompletion,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(habit.name);

  const startEditing = () => {
    setIsEditing(true);
    setEditingName(habit.name);
  };

  const saveEdit = () => {
    if (editingName.trim() !== '') {
      onEdit(habit, editingName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              onBlur={saveEdit}
              className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-sm"
              autoFocus
            />
          ) : (
            <>
              <span className="text-sm font-medium text-neutral-300">{habit.name}</span>
              <button 
                onClick={startEditing}
                className="text-neutral-500 hover:text-blue-500"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="h-3 w-3"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" 
                  />
                </svg>
              </button>
            </>
          )}
          <button 
            onClick={() => onDelete(habit.id)}
            className="text-neutral-500 hover:text-red-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-medium ${getStreakColor(habit.streak)}`}>
            Streak: {habit.streak}
          </span>
          {/* Streak indicator icons */}
          {habit.streak > 1 && habit.streak < 5 && (
            <span title="Building streak">🔥</span>
          )}
          {habit.streak >= 5 && habit.streak < 10 && (
            <span title="5+ day streak">🔥</span>
          )}
          {habit.streak >= 10 && habit.streak < 30 && (
            <span title="10+ day streak">🔥🔥</span>
          )}
          {habit.streak >= 30 && habit.streak < 100 && (
            <span title="30+ day streak">💎</span>
          )}
          {habit.streak >= 100 && (
            <span title="100+ day streak">👑</span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        {[...Array(7)].map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 3 + i); // Center today
          const dateStr = date.toISOString().split('T')[0];
          const isToday = i === 3;
          const isPast = i < 3;
          const isCompleted = habit.completedDates.includes(dateStr);
          
          return (
            <button 
              key={i}
              onClick={() => isPast || isToday ? onToggleCompletion(habit.id, dateStr) : null}
              disabled={!isPast && !isToday}
              className={`
                flex-1 rounded-md relative transition-all py-2
                ${isToday ? 'ring-2 ring-neutral-600' : ''}
                ${isPast || isToday 
                  ? isCompleted 
                    ? 'bg-green-600 hover:bg-green-700'
                    : habit.notCompletedDates.includes(dateStr)
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  : 'bg-neutral-800 cursor-not-allowed opacity-50'
                }
              `}
              title={`${date.toLocaleDateString()} - ${isCompleted ? 'Completed' : habit.notCompletedDates.includes(dateStr) ? 'Not completed' : 'Unknown'}`}
            >
              <div className="flex flex-col items-center justify-center space-y-0.5">
                <span className="text-[10px] text-neutral-300 font-medium">
                  {getDayName(date)}
                </span>
                <span className="text-[10px] text-neutral-300">
                  {isCompleted ? '✓' : habit.notCompletedDates.includes(dateStr) ? '✗' : '?'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default HabitListItem; 