import { useState, useEffect } from 'react';

const Calendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<Date | null>>([]);

  useEffect(() => {
    // Update date every minute
    const intervalId = setInterval(() => setDate(new Date()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    generateCalendarDays(date);
  }, [date]);

  const generateCalendarDays = (currentDate: Date) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Array to hold all calendar days
    const days: Array<Date | null> = [];
    
    // Add empty slots for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    setCalendarDays(days);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <div className="text-2xl font-semibold text-neutral-200">
          {date.getDate()} {monthNames[date.getMonth()]} {date.getFullYear()}
        </div>
        <div className="text-lg text-neutral-400">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]}
        </div>
        <div className="text-3xl font-bold text-neutral-200 mt-2">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="mt-6">
        <div className="text-lg font-medium text-neutral-300 mb-2">{monthNames[date.getMonth()]} {date.getFullYear()}</div>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs text-neutral-400">{day}</div>
          ))}
          
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`text-center p-1 text-sm ${
                day ? (
                  day.getDate() === date.getDate() && day.getMonth() === date.getMonth() 
                    ? 'bg-blue-600 text-white rounded-full' 
                    : 'text-neutral-300'
                ) : 'text-transparent'
              }`}
            >
              {day ? day.getDate() : '.'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 