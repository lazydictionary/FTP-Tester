import React from 'react';
import './CountdownOverlay.css';

export default function CountdownOverlay({ 
  isVisible, 
  secondsRemaining, 
  darkMode,
  testType 
}) {
  if (!isVisible || secondsRemaining === null) return null;

  const getCountdownText = () => {
    if (secondsRemaining === 1) {
      return testType === 'ramp' ? 'POWER UP!' : 'INTERVAL CHANGE!';
    }
    return secondsRemaining.toString();
  };

  return (
    <div className={`countdown-overlay ${darkMode ? 'dark' : 'light'}`}>
      <div className="countdown-content">
        <div className="countdown-number">
          {getCountdownText()}
        </div>
        <div className="countdown-subtitle">
          {secondsRemaining > 1 ? 'Get Ready...' : ''}
        </div>
      </div>
    </div>
  );
}