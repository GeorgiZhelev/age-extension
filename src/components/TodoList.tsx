import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

// Add a new interface for storage with timestamp
interface TodoState {
  todos: Todo[];
  lastUpdated: number;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Load todos from storage when component mounts
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storage = await browser.storage.local.get('todoState');
        if (storage.todoState) {
          const todoState = storage.todoState as TodoState;
          setTodos(todoState.todos);
          setLastUpdated(todoState.lastUpdated);
        }
      } catch (error) {
        console.error('Error loading todos:', error);
        // If browser.storage is not available (during development), load demo todos
        setTodos([
          { id: '1', text: 'Check and respond to unread emails', completed: false },
          { id: '2', text: 'Update the software', completed: false },
          { id: '3', text: 'Clean the document folder', completed: true },
          { id: '4', text: 'Set up git ssh', completed: false }
        ]);
      }
    };
    
    loadTodos();
  }, []);

  // Set up sync interval to check for updates from other tabs
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const storage = await browser.storage.local.get('todoState');
        if (storage.todoState) {
          const storedState = storage.todoState as TodoState;
          
          // Only update if storage has newer data than our current state
          if (storedState.lastUpdated > lastUpdated) {
            setTodos(storedState.todos);
            setLastUpdated(storedState.lastUpdated);
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Check for updates every second
    const intervalId = setInterval(checkForUpdates, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  // Save todos to storage whenever they change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        // Create a timestamp when saving
        const currentTime = Date.now();
        setLastUpdated(currentTime);
        
        // Save both todos and timestamp
        await browser.storage.local.set({ 
          todoState: {
            todos,
            lastUpdated: currentTime
          }
        });
      } catch (error) {
        console.error('Error saving todos:', error);
      }
    };
    
    if (todos.length > 0) {
      saveTodos();
    }
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodo,
        completed: false
      }
    ]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-lg shadow-lg flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-neutral-200 font-sans">Todo list</h2>
        <button 
          className="text-neutral-400 hover:text-neutral-200" 
          onClick={() => {
            if (confirm('Clear all todos?')) {
              setTodos([]);
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <ul className="space-y-1 mb-3 flex-grow overflow-y-auto font-sans min-h-0">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-start gap-2 group">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="peer sr-only" // Hide default checkbox but keep functionality
              />
              <div 
                className="h-5 w-5 mt-0.5 rounded-md border border-neutral-600 bg-neutral-800 flex items-center justify-center 
                          cursor-pointer transition-all duration-150 hover:border-blue-500
                          peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-opacity-50"
                onClick={() => toggleTodo(todo.id)}
              >
                {todo.completed && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
            <span className={`text-neutral-300 transition-all duration-200 ${todo.completed ? 'line-through text-neutral-500' : ''}`}>
              {todo.text}
            </span>

            <button 
              onClick={() => deleteTodo(todo.id)}
              className="ml-auto text-neutral-500 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add task"
          className="flex-1 bg-neutral-800 text-neutral-200 px-2 py-1 rounded border border-neutral-700 focus:ring-blue-500 focus:border-blue-500 font-sans text-sm"
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-sans text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default TodoList; 