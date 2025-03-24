import { useState, useEffect } from 'react';

interface AgeCounterProps {
  birthDate?: string; // Make birthDate optional
}

const AgeCounter: React.FC<AgeCounterProps> = ({ birthDate: propsBirthDate }) => {
  const [birthDate, setBirthDate] = useState<string | undefined>(propsBirthDate);
  const [wholeYears, setWholeYears] = useState<number>(0);
  const [decimalPart, setDecimalPart] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>('');

  useEffect(() => {
    if (!birthDate) return;

    const updateAge = () => {
      const birthDateTime = new Date(birthDate).getTime();
      const now = new Date().getTime();
      const ageInMilliseconds = now - birthDateTime;
      
      // Convert to years (approximate)
      const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
      const ageInYears = ageInMilliseconds / millisecondsInYear;
      
      // Split into whole number and decimal part
      const wholeAge = Math.floor(ageInYears);
      const decimal = ageInYears - wholeAge;
      
      // Format the decimal part
      const formattedDecimal = decimal.toFixed(11).substring(1);
      
      setWholeYears(wholeAge);
      setDecimalPart(formattedDecimal);
    };

    // Update initially
    updateAge();
    
    // Then update every 100ms
    const intervalId = setInterval(updateAge, 100);
    
    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [birthDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputDate) {
      setBirthDate(inputDate);
    }
  };

  if (!birthDate) {
    return (
      <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl text-neutral-300 mb-4 font-light">Enter your birth date</div>
          <form onSubmit={handleSubmit}>
            <input
              type="date"
              className="px-4 py-2 rounded bg-neutral-800 text-neutral-200 mb-4"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              required
            />
            <div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-neutral-700 text-neutral-200 rounded hover:bg-neutral-600"
              >
                Calculate Age
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl text-neutral-300 mb-1 font-light">AGE</div>
        <div className="flex justify-center items-baseline">
          <span className="text-[16rem] font-light text-neutral-300 leading-none font-mono">{wholeYears}</span>
          <span className="text-7xl text-neutral-300 leading-none font-mono">{decimalPart.substring(0, 6)}</span>
          <span className="text-3xl text-neutral-300 leading-none font-mono">{decimalPart.substring(6)}</span>
        </div>
        <button 
          onClick={() => setBirthDate(undefined)} 
          className="mt-4 px-3 py-1 text-sm bg-neutral-800 text-neutral-400 rounded hover:bg-neutral-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AgeCounter; 