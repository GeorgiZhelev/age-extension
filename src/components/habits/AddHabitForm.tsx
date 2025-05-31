import React, { useState } from 'react';

interface AddHabitFormProps {
  onAdd: (habitName: string) => void;
  onCancel: () => void;
}

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAdd, onCancel }) => {
  const [habitName, setHabitName] = useState('');

  const handleSubmit = () => {
    if (habitName.trim() !== '') {
      onAdd(habitName.trim());
      setHabitName('');
    }
  };

  return (
    <div className="mt-2 flex gap-1">
      <input
        type="text"
        value={habitName}
        onChange={(e) => setHabitName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="New habit"
        className="flex-1 bg-neutral-800 text-neutral-200 px-2 py-1 rounded border border-neutral-700 focus:ring-blue-500 focus:border-blue-500 font-sans text-xs"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 font-sans text-xs"
      >
        Add
      </button>
      <button
        onClick={() => {
          setHabitName('');
          onCancel();
        }}
        className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded hover:bg-neutral-700 font-sans text-xs"
      >
        ✕
      </button>
    </div>
  );
};

export default AddHabitForm; 