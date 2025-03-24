import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // Array of ISO date strings
  streak: number;
  notCompletedDates: string[]; // Add this new field to track explicit "not done" dates
}

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabitName, setEditingHabitName] = useState('');
  
  // Load habits from storage when component mounts
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storage = await browser.storage.local.get('habits');
        if (storage.habits) {
          // Migrate existing habits to include notCompletedDates if missing
          const migratedHabits = (storage.habits as Habit[]).map(habit => ({
            ...habit,
            notCompletedDates: habit.notCompletedDates || []
          }));
          setHabits(migratedHabits);
        }
      } catch (error) {
        console.error('Error loading habits:', error);
        // Demo habits for development
        setHabits([
          { id: '1', name: 'Meditate', completedDates: generateDemoData(0.8), streak: 3, notCompletedDates: [] },
          { id: '2', name: 'Exercise', completedDates: generateDemoData(0.6), streak: 1, notCompletedDates: [] },
          { id: '3', name: 'Read', completedDates: generateDemoData(0.9), streak: 5, notCompletedDates: [] }
        ]);
      }
    };
    
    loadHabits();
  }, []);
  
  // Helper function to generate demo data
  const generateDemoData = (probability: number): string[] => {
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

  // Save habits to storage whenever they change
  useEffect(() => {
    const saveHabits = async () => {
      try {
        await browser.storage.local.set({ habits });
      } catch (error) {
        console.error('Error saving habits:', error);
      }
    };
    
    if (habits.length > 0) {
      saveHabits();
    }
  }, [habits]);

  // Add a new habit
  const addHabit = () => {
    if (newHabit.trim() !== '') {
      const newHabitItem: Habit = {
        id: Date.now().toString(),
        name: newHabit.trim(),
        completedDates: [],
        notCompletedDates: [],
        streak: 0
      };
      
      setHabits([...habits, newHabitItem]);
      setNewHabit('');
      setIsAddingHabit(false);
    }
  };

  // Delete a habit
  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  // Modify toggleHabitCompletion to accept a specific date
  const toggleHabitCompletion = (id: string, dateStr: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = habit.completedDates.includes(dateStr);
        const isNotCompleted = habit.notCompletedDates.includes(dateStr);
        
        let updatedCompletedDates = [...habit.completedDates];
        let updatedNotCompletedDates = [...habit.notCompletedDates];
        
        if (!isCompleted && !isNotCompleted) {
          // Move from unknown to completed
          updatedCompletedDates.push(dateStr);
        } else if (isCompleted) {
          // Move from completed to not completed
          updatedCompletedDates = updatedCompletedDates.filter(date => date !== dateStr);
          updatedNotCompletedDates.push(dateStr);
        } else {
          // Move from not completed back to unknown
          updatedNotCompletedDates = updatedNotCompletedDates.filter(date => date !== dateStr);
        }
        
        return {
          ...habit,
          completedDates: updatedCompletedDates,
          notCompletedDates: updatedNotCompletedDates,
          streak: calculateStreak(updatedCompletedDates)
        };
      }
      return habit;
    }));
  };

  // Calculate streak for a given set of dates
  const calculateStreak = (dates: string[]): number => {
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
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Add new function to handle habit name editing
  const startEditingHabit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingHabitName(habit.name);
  };

  const saveHabitEdit = () => {
    if (editingHabitName.trim() !== '') {
      setHabits(habits.map(habit => 
        habit.id === editingHabitId 
          ? { ...habit, name: editingHabitName.trim() }
          : habit
      ));
    }
    setEditingHabitId(null);
    setEditingHabitName('');
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-200 font-sans">Habits</h2>
        <button
          onClick={() => setIsAddingHabit(true)}
          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          Add Habit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {habits.map(habit => (
          <div key={habit.id} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                {editingHabitId === habit.id ? (
                  <input
                    type="text"
                    value={editingHabitName}
                    onChange={(e) => setEditingHabitName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveHabitEdit()}
                    onBlur={saveHabitEdit}
                    className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-sm"
                    autoFocus
                  />
                ) : (
                  <>
                    <span className="text-sm font-medium text-neutral-300">{habit.name}</span>
                    <button 
                      onClick={() => startEditingHabit(habit)}
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
                  onClick={() => deleteHabit(habit.id)}
                  className="text-neutral-500 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <span className="text-xs font-medium text-neutral-400">
                Streak: {habit.streak}
              </span>
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
                    onClick={() => isPast || isToday ? toggleHabitCompletion(habit.id, dateStr) : null}
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
        ))}
      </div>

      {isAddingHabit && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="New habit name"
            className="flex-1 bg-neutral-800 text-neutral-200 px-2 py-1 rounded border border-neutral-700 focus:ring-blue-500 focus:border-blue-500 font-sans text-sm"
            autoFocus
          />
          <button
            onClick={addHabit}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-sans text-sm"
          >
            Add
          </button>
          <button
            onClick={() => {
              setNewHabit('');
              setIsAddingHabit(false);
            }}
            className="bg-neutral-800 text-neutral-400 px-3 py-1 rounded hover:bg-neutral-700 font-sans text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default HabitTracker; 