import React, { useState } from 'react';
import { Habit } from './types';

interface CompactHabitItemProps {
  habit: Habit;
  onToggleCompletion: (habitId: string, date: string) => void;
  onEdit: (habit: Habit, newName: string) => void;
  onDelete: (habitId: string) => void;
  habitColor: string;
}

const CompactHabitItem: React.FC<CompactHabitItemProps> = ({
  habit,
  onToggleCompletion,
  onEdit,
  onDelete,
  habitColor
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(habit.name);
  const today = new Date().toLocaleDateString('en-CA');
  const isCompletedToday = habit.completedDates.includes(today);
  const isNotCompletedToday = habit.notCompletedDates.includes(today);

  const handleEdit = () => {
    if (editName.trim() && editName !== habit.name) {
      onEdit(habit, editName);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          onClick={() => onToggleCompletion(habit.id, today)}
          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
            isCompletedToday 
              ? `${habitColor} border-transparent` 
              : isNotCompletedToday
              ? 'bg-red-900/50 border-red-700'
              : 'border-neutral-600 hover:border-neutral-500'
          }`}
        >
          {isCompletedToday && (
            <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isNotCompletedToday && (
            <svg className="w-full h-full text-red-300 p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
        
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
            className="bg-neutral-700 text-white px-1 py-0.5 rounded text-sm flex-1"
            autoFocus
          />
        ) : (
          <span 
            className="text-sm text-neutral-300 truncate cursor-pointer"
            onClick={() => setIsEditing(true)}
            title={habit.name}
          >
            {habit.name}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-shrink-0">
        {habit.streak > 0 && (
          <span className="text-xs text-neutral-500">
            {habit.streak}🔥
          </span>
        )}
        <button
          onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all p-0.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CompactHabitItem;