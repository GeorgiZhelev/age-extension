import { useState, useEffect } from 'react';

const TimeProgress: React.FC = () => {
  const [progress, setProgress] = useState({
    day: 0,
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
      
      // Month progress
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const monthProgress = ((now.getDate() - 1 + elapsedMsInDay / totalMsInDay) / daysInMonth) * 100;
      
      // Year progress
      const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();
      const endOfYear = new Date(now.getFullYear() + 1, 0, 1).getTime();
      const yearProgress = ((now.getTime() - startOfYear) / (endOfYear - startOfYear)) * 100;
      
      setProgress({
        day: dayProgress,
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
      {renderProgressBar("Year", progress.year)}
      {renderProgressBar("Month", progress.month)}
      {renderProgressBar("Day", progress.day)}
    </div>
  );
};

export default TimeProgress; 