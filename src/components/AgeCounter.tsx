import { useState, useEffect } from 'react';

interface AgeCounterProps {
  birthDate: string; // ISO date string format
}

const AgeCounter: React.FC<AgeCounterProps> = ({ birthDate }) => {
  const [wholeYears, setWholeYears] = useState<number>(0);
  const [decimalPart, setDecimalPart] = useState<string>('');

  useEffect(() => {
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

  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl text-neutral-300 mb-1 font-light">AGE</div>
        <div className="flex justify-center items-baseline">
          <span className="text-[16rem] font-light text-neutral-300 leading-none font-mono">{wholeYears}</span>
          <span className="text-7xl text-neutral-300 leading-none font-mono">{decimalPart}</span>
        </div>
      </div>
    </div>
  );
};

export default AgeCounter; 