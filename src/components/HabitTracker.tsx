import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import { ResponsiveLine } from '@nivo/line';

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
  const [viewMode, setViewMode] = useState<'regular' | 'calendar' | 'cumulative'>('regular');
  
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

  // Generate dates for the past 30 days
  const generatePast30Days = () => {
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
  const calculateCumulativeCompletions = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return [];
    
    const past30Days = generatePast30Days();
    let cumulative = 0;
    
    return past30Days.map(date => {
      if (habit.completedDates.includes(date)) {
        cumulative += 1;
      }
      return { date, cumulative };
    });
  };

  // Generate a consistent and distinct color for each habit
  const getHabitColor = (habitId: string) => {
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

  // Render a combined calendar view for all habits
  const renderCombinedCalendarView = () => {
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
                        onClick={() => toggleHabitCompletion(habit.id, dateStr)}
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

  // Update the cumulative chart rendering to use Nivo and show all habits
  const renderCumulativeCharts = () => {
    
    // Prepare data for Nivo chart - one line per habit
    const chartData = habits.map(habit => {
      const cumulativeData = calculateCumulativeCompletions(habit.id);
      
      return {
        id: habit.name,
        color: getHabitColor(habit.id).replace('bg-', '').split('-')[0],
        data: cumulativeData.map(d => ({
          x: d.date,
          y: d.cumulative
        }))
      };
    });
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-neutral-300 mb-4 text-center">
          All Habits - Cumulative Completions
        </h3>
        
        {/* Color legend as a horizontal list - similar to calendar view */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${getHabitColor(habit.id)}`}></div>
              <span className="text-xs text-neutral-300">{habit.name}</span>
            </div>
          ))}
        </div>
        
        <div className="h-64 bg-neutral-800 rounded border border-neutral-700 p-2">
          <ResponsiveLine
            data={chartData}
            margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
            xScale={{ type: 'point' }}
            yScale={{
              type: 'linear',
              min: 0,
              max: 'auto',
              stacked: false,
            }}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              format: (value) => value.slice(5), // Show only MM-DD part
              legend: 'Date',
              legendOffset: 40,
              legendPosition: 'middle',
              // Show fewer ticks on x-axis to avoid cluttering
              tickValues: chartData[0]?.data.map((d, i) => i % 3 === 0 ? d.x : '').filter(Boolean)
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: 'Completions',
              legendOffset: -40,
              legendPosition: 'middle',
              truncateTickAt: 0,
            }}
            colors={{ scheme: 'category10' }}
            pointSize={8}
            // Make points solid by setting the color the same as the border
            pointColor={{ from: 'serieColor' }}
            pointBorderWidth={1}
            pointBorderColor={{ from: 'serieColor' }}
            pointLabelYOffset={-12}
            enableSlices="x"
            useMesh={true}
            enableCrosshair={true}
            tooltip={(props) => {
              // Make sure we have point data to display
              if (!props.point) return null;
              
              // Log for debugging
              console.log("Tooltip data:", props.point.data.x);
              
              // More robust date parsing
              const dateStr = String(props.point.data.x);
              let formattedDate;
              
              try {
                // ISO date format like "2023-04-12"
                const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
                const date = new Date(year, month - 1, day);
                
                if (isNaN(date.getTime())) {
                  // Fallback if date is invalid
                  formattedDate = dateStr;
                } else {
                  formattedDate = `${getDayName(date)}, ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                }
              } catch (e) {
                // If any parsing errors, just show the raw string
                formattedDate = dateStr;
              }
              
              return (
                <div
                  style={{
                    background: '#212121',
                    padding: '9px 12px',
                    border: '1px solid #444',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ marginBottom: '5px', fontSize: '14px', color: '#f0f0f0' }}>
                    {formattedDate}
                  </div>
                  <div
                    style={{
                      padding: '3px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <div
                      style={{
                        width: '12px',
                        height: '12px',
                        background: props.point.serieColor,
                        borderRadius: '50%'
                      }}
                    />
                    <span style={{ fontSize: '12px', color: '#f0f0f0' }}>
                      {props.point.serieId}: {String(props.point.data.y)} completions
                    </span>
                  </div>
                </div>
              );
            }}
            legends={[]}
            theme={{
              axis: {
                ticks: {
                  text: {
                    fill: '#a3a3a3',
                    fontSize: 10
                  }
                },
                legend: {
                  text: {
                    fill: '#a3a3a3',
                    fontSize: 12
                  }
                }
              },
              grid: {
                line: {
                  stroke: '#404040',
                  strokeWidth: 1
                }
              },
              tooltip: {
                container: {
                  background: '#212121',
                  color: '#f0f0f0',
                  fontSize: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5)'
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-200 font-sans">Habits</h2>
        <div className="flex gap-2">
          {/* View mode buttons with icons */}
          <div className="flex rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('regular')}
              className={`p-1.5 ${viewMode === 'regular' ? 'bg-blue-600' : 'bg-neutral-800 text-neutral-400'}`}
              title="Habits View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 ${viewMode === 'calendar' ? 'bg-blue-600' : 'bg-neutral-800 text-neutral-400'}`}
              title="Calendar View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`p-1.5 ${viewMode === 'cumulative' ? 'bg-blue-600' : 'bg-neutral-800 text-neutral-400'}`}
              title="Chart View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setIsAddingHabit(true)}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Add Habit
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'regular' && habits.map(habit => (
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

        {viewMode === 'calendar' && (
          <div className="overflow-y-auto">
            {renderCombinedCalendarView()}
          </div>
        )}

        {viewMode === 'cumulative' && (
          <div className="overflow-y-auto">
            {renderCumulativeCharts()}
          </div>
        )}
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