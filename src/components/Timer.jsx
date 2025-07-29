import React, { useEffect, useState } from 'react';
import './Timer.css';

export default function Timer({ seconds, isRunning, onToggle, testType }) {
  const [displayTime, setDisplayTime] = useState('0:00');

  // Smooth time formatting with leading zeros
  useEffect(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    setDisplayTime(`${mins}:${secs.toString().padStart(2, '0')}`);
  }, [seconds]);

  return (
    <div className="timer-container">
      <div className="time-display">
        {testType === '20min' ? 'Remaining: ' : 'Elapsed: '}
        <span className="time-value">{displayTime}</span>
      </div>
      <button 
        onClick={onToggle}
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