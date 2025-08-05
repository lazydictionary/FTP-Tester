import React, { useEffect, useState, useRef } from 'react';
import './Timer.css';
import NoSleep from 'nosleep.js';

export default function Timer({ seconds, isRunning, onToggle, testType }) {
  const [displayTime, setDisplayTime] = useState('0:00');
  const noSleepRef = useRef(null);

  // Format time
  useEffect(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`);
  }, [seconds]);

  // Handle toggle with NoSleep logic
  const handleToggle = () => {
    if (!isRunning) {
      if (!noSleepRef.current) {
        noSleepRef.current = new NoSleep();
        console.log('NoSleep enabled');
      }
      noSleepRef.current.enable();
    } else {
      if (noSleepRef.current) {
        noSleepRef.current.disable();
      }
    }

    // Call the original toggle function passed as a prop
    onToggle();
  };

  return (
    <div className="timer-container">
      <div className="time-display">
        {testType === '20min' ? 'Remaining: ' : 'Elapsed: '}
        <span className="time-value">{displayTime}</span>
      </div>
      <button 
        onClick={handleToggle}
        className={`timer-button ${isRunning ? 'pause' : 'start'}`}
        aria-label={isRunning ? 'Pause test' : 'Start test'}
      >
        {isRunning ? (
          <>
            <span className="icon">⏸</span>Pause
          </>
        ) : (
          <>
            <span className="icon">▶</span>Start
          </>
        )}
      </button>
    </div>
  );
}
