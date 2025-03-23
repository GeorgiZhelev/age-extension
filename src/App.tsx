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
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="space-y-6">
              <AgeCounter birthDate={birthDate} />
              <Calendar />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <TodoList />
          </div>
          
          <div className="md:col-span-1">
            <MostVisited />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
