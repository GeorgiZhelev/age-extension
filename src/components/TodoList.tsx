import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Load todos from storage when component mounts
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storage = await browser.storage.local.get('todos');
        if (storage.todos) {
          setTodos(storage.todos as Todo[]);
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

  // Save todos to storage whenever they change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await browser.storage.local.set({ todos });
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
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-neutral-200">Todo list</h2>
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
      
      <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className={`flex-1 text-neutral-300 ${todo.completed ? 'line-through text-neutral-500' : ''}`}>
              {todo.text}
            </span>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className="text-neutral-500 hover:text-red-500"
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
          className="flex-1 bg-neutral-800 text-neutral-200 px-3 py-2 rounded border border-neutral-700 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={addTodo}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default TodoList; 