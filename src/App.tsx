import { useState } from 'react'
import AgeCounter from './components/AgeCounter'
import Calendar from './components/Calendar'
import TodoList from './components/TodoList'
import MostVisited from './components/MostVisited'
import TimeProgress from './components/TimeProgress'
import HabitTracker from './components/HabitTracker'
import './App.css'

function App() {
  // Your birthday in ISO format
  const [birthDate] = useState('1997-11-28')

  return (
    <div className="h-screen w-screen bg-neutral-950 text-white p-2 overflow-hidden">
      <div className="grid grid-cols-12 gap-3 h-full">
        {/* Left column - Calendar (smaller) */}
        <div className="col-span-2">
          <Calendar />
        </div>
        
        {/* Middle column - Age Counter (bigger) */}
        <div className="col-span-7">
          <AgeCounter birthDate={birthDate} />
        </div>
        
        {/* Right column - Todo List (narrower) */}
        <div className="col-span-3 flex flex-col h-full">
          <TodoList />
        </div>
        
        {/* Bottom row */}
        <div className="col-span-6 col-start-1">
          <MostVisited />
        </div>
        
        {/* Time Progress (20% width) */}
        <div className="col-span-3 col-start-7">
          <TimeProgress />
        </div>

        {/* Habit Tracker */}
        <div className="col-span-3 col-start-10">
          <HabitTracker />
        </div>
      </div>
    </div>
  )
}

export default App
