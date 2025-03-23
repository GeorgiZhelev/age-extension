import { useState } from 'react'
import AgeCounter from './components/AgeCounter'
import Calendar from './components/Calendar'
import TodoList from './components/TodoList'
import MostVisited from './components/MostVisited'
import './App.css'

function App() {
  // Your birthday in ISO format
  const [birthDate] = useState('1997-11-28')

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full">
        {/* Left column - Calendar */}
        <div className="md:col-span-4">
          <Calendar />
        </div>
        
        {/* Middle column - Age Counter */}
        <div className="md:col-span-4">
          <AgeCounter birthDate={birthDate} />
        </div>
        
        {/* Right column - Todo List (spanning full height) */}
        <div className="md:col-span-4 flex flex-col md:row-span-2">
          <div className="h-full">
            <TodoList />
          </div>
        </div>
        
        {/* Bottom left - Most Visited (spanning 8 columns) */}
        <div className="md:col-span-8 md:col-start-1">
          <MostVisited />
        </div>
      </div>
    </div>
  )
}

export default App
