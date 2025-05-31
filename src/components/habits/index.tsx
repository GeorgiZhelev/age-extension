import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { Habit, ViewMode } from './types';
import { calculateStreak, generateDemoData } from './utils';
import { getHabitColor } from './styles';
import CompactHabitItem from './CompactHabitItem';
import CalendarView from './CalendarView';
import CumulativeView from './CumulativeView';
import AddHabitForm from './AddHabitForm';
import HabitStats from './HabitStats';

// Update the storage type to include a timestamp
interface HabitState {
  habits: Habit[];  // Using your existing Habit type
  lastUpdated: number;
}

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('regular');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  
  // Load habits from storage when component mounts
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const storage = await browser.storage.local.get('habitState');
        if (storage.habitState) {
          const habitState = storage.habitState as HabitState;
          setHabits(habitState.habits);
          setLastUpdated(habitState.lastUpdated);
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

  // Set up sync interval to check for updates from other tabs
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const storage = await browser.storage.local.get('habitState');
        if (storage.habitState) {
          const storedState = storage.habitState as HabitState;
          
          // Only update if storage has newer data than our current state
          if (storedState.lastUpdated > lastUpdated) {
            setHabits(storedState.habits);
            setLastUpdated(storedState.lastUpdated);
          }
        }
      } catch (error) {
        console.error('Error checking for habit updates:', error);
      }
    };

    // Check for updates every second
    const intervalId = setInterval(checkForUpdates, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  // Save habits to storage whenever they change
  useEffect(() => {
    const saveHabits = async () => {
      try {
        // Create a timestamp when saving
        const currentTime = Date.now();
        setLastUpdated(currentTime);
        
        // Save both habits and timestamp
        await browser.storage.local.set({ 
          habitState: {
            habits,
            lastUpdated: currentTime
          }
        });
      } catch (error) {
        console.error('Error saving habits:', error);
      }
    };
    
    if (habits.length > 0) {
      saveHabits();
    }
  }, [habits]);

  // Add a new habit
  const addHabit = (habitName: string) => {
    if (habitName.trim() !== '') {
      const newHabitItem: Habit = {
        id: Date.now().toString(),
        name: habitName.trim(),
        completedDates: [],
        notCompletedDates: [],
        streak: 0
      };
      
      setHabits([...habits, newHabitItem]);
      setIsAddingHabit(false);
    }
  };

  // Delete a habit
  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  // Toggle habit completion for a specific date
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

  // Edit a habit name
  const editHabit = (habit: Habit, newName: string) => {
    setHabits(habits.map(h => 
      h.id === habit.id 
        ? { ...h, name: newName }
        : h
    ));
  };

  // Helper function to get color for a habit
  const getHabitColorWrapper = (habitId: string): string => {
    return getHabitColor(habits, habitId);
  };

  return (
    <div className="bg-neutral-900 p-3 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex flex-col gap-2 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-neutral-200 font-sans">Habits</h2>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="text-xs p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
            title="Add Habit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <div className="flex rounded-md overflow-hidden">
          <button
            onClick={() => setViewMode('regular')}
            className={`flex-1 p-1 text-xs ${viewMode === 'regular' ? 'bg-blue-600' : 'bg-neutral-800 text-neutral-400'}`}
            title="List"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 p-1 text-xs ${viewMode === 'calendar' ? 'bg-blue-600' : 'bg-neutral-800 text-neutral-400'}`}
            title="Calendar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('cumulative')}
            className={`flex-1 p-1 text-xs ${viewMode === 'cumulative' ? 'bg-blue-600' : 'bg-neutral-800 text-neutral-400'}`}
            title="Chart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'regular' && (
          <>
            {habits.length > 0 ? (
              <>
                <HabitStats habits={habits} />
                {habits.map(habit => (
                  <CompactHabitItem
                    key={habit.id}
                    habit={habit}
                    onToggleCompletion={toggleHabitCompletion}
                    onEdit={editHabit}
                    onDelete={deleteHabit}
                    habitColor={getHabitColorWrapper(habit.id)}
                  />
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <svg className="w-12 h-12 text-neutral-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p className="text-neutral-500 text-sm mb-2">No habits yet</p>
                <p className="text-neutral-600 text-xs">Click the + button to add your first habit</p>
              </div>
            )}
          </>
        )}

        {viewMode === 'calendar' && (
          <CalendarView
            habits={habits}
            getHabitColor={getHabitColorWrapper}
            onToggleCompletion={toggleHabitCompletion}
          />
        )}

        {viewMode === 'cumulative' && (
          <CumulativeView
            habits={habits}
            getHabitColor={getHabitColorWrapper}
          />
        )}
      </div>

      {isAddingHabit && (
        <AddHabitForm
          onAdd={addHabit}
          onCancel={() => setIsAddingHabit(false)}
        />
      )}
    </div>
  );
};

export default HabitTracker; 