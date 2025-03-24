import { useState, useEffect } from 'react';

const TimeProgress: React.FC = () => {
  const [progress, setProgress] = useState({
    day: 0,
    week: 0,
    month: 0,
    year: 0
  });

  useEffect(() => {
    const calculateProgress = () => {
      const now = new Date();
      
      // Day progress
      const totalMsInDay = 24 * 60 * 60 * 1000;
      const elapsedMsInDay = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000 + now.getMilliseconds();
      const dayProgress = (elapsedMsInDay / totalMsInDay) * 100;
      
      const dayOfWeek = now.getDay(); // 0 (Sunday) through 6 (Saturday)
      const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0 (Monday) through 6 (Sunday)
      const weekProgress = ((adjustedDayOfWeek * 24 * 60 * 60 * 1000 + elapsedMsInDay) / (7 * 24 * 60 * 60 * 1000)) * 100;
      
      // Month progress
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthProgress = ((now.getDate() - 1 + elapsedMsInDay / totalMsInDay) / daysInMonth) * 100;
      
      // Year progress
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1).getTime();
      const yearProgress = ((now.getTime() - startOfYear) / (endOfYear - startOfYear)) * 100;
      
      setProgress({
        day: dayProgress,
        week: weekProgress,
        month: monthProgress,
        year: yearProgress
      });
    };

    calculateProgress();
    
    // Update every second
    const interval = setInterval(calculateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to render a progress bar
  const renderProgressBar = (label: string, value: number) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-neutral-300">{label}</span>
        <span className="text-sm font-medium text-neutral-300">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-neutral-800 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full flex flex-col justify-center">
      <h2 className="text-xl font-semibold text-neutral-200 mb-6 font-sans">Time Progress</h2>
      {renderProgressBar("Day", progress.day)}
      {renderProgressBar("Week", progress.week)}
      {renderProgressBar("Month", progress.month)}
      {renderProgressBar("Year", progress.year)}
    </div>
  );
};

export default TimeProgress; 