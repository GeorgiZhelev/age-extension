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
    <div className="min-h-screen bg-neutral-950 text-white p-6 flex flex-col justify-between">
      <div className="w-full">
        {/* Top section - Age Counter (centered and larger) */}
        <div className="mb-8 flex justify-center">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <AgeCounter birthDate={birthDate} />
          </div>
        </div>
        
        {/* Middle section - Calendar and Todo List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Calendar />
          </div>
          <div>
            <TodoList />
          </div>
        </div>
      </div>
      
      {/* Bottom section - Most Visited (centered) */}
      <div className="w-full flex justify-center">
        <div className="w-full">
          <MostVisited />
        </div>
      </div>
    </div>
  )
}

export default App
