import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Habit } from './types';
import { calculateCumulativeCompletions } from './utils';

interface CumulativeViewProps {
  habits: Habit[];
  getHabitColor: (habitId: string) => string;
}

const CumulativeView: React.FC<CumulativeViewProps> = ({
  habits,
  getHabitColor
}) => {
  // Helper to format day name
  const getDayName = (date: Date): string => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Prepare data for Nivo chart - one line per habit
  const chartData = habits.map(habit => {
    const cumulativeData = calculateCumulativeCompletions(habit);
    
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
      
      <div className="h-48 bg-neutral-800 rounded border border-neutral-700 p-1">
        <ResponsiveLine
          data={chartData}
          margin={{ top: 5, right: 10, bottom: 40, left: 25 }}
          xScale={{ type: 'point' }}
          yScale={{
            type: 'linear',
            min: 0,
            max: 'auto',
            stacked: false,
          }}
          axisBottom={{
            tickSize: 3,
            tickPadding: 3,
            tickRotation: -45,
            format: (value) => value.slice(5), // Show only MM-DD part
            legend: '',
            legendOffset: 30,
            legendPosition: 'middle',
            // Show fewer ticks on x-axis to avoid cluttering
            tickValues: chartData[0]?.data.map((d, i) => i % 5 === 0 ? d.x : '').filter(Boolean)
          }}
          axisLeft={{
            tickSize: 3,
            tickPadding: 3,
            tickRotation: 0,
            legend: '',
            legendOffset: -20,
            legendPosition: 'middle',
            truncateTickAt: 0,
          }}
          colors={d => {
            const habit = habits.find(h => h.name === d.id);
            if (!habit) return '#000000';
            
            // Map Tailwind color classes to actual hex colors
            const colorMap: Record<string, string> = {
              'green': '#10b981', // or whatever shade matches your Tailwind green
              'pink': '#ec4899',  // or whatever shade matches your Tailwind pink
              'blue': '#3b82f6',  // or whatever shade matches your Tailwind blue
              // Add other colors as needed
            };
            
            const colorName = getHabitColor(habit.id).replace('bg-', '').split('-')[0];
            return colorMap[colorName] || '#cccccc'; // fallback color
          }}
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
            } catch {
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

export default CumulativeView; 