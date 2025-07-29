import React, { useState, useEffect, useMemo } from 'react';
import PowerGraph from '../components/PowerGraph';
import Timer from '../components/Timer';
import './TestScreen.css';

export default function TestScreen({ 
  testType, 
  currentFTP, 
  goalFTP, 
  protocol = null,
  warmup = null,
  darkMode,
  toggleDarkMode
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Unified stage text for both test types
  const getStageText = () => {
    const minutes = elapsedSeconds / 60;
    if (minutes < 5) return 'Warmup Phase';
    if (minutes >= 19.5) return 'Current FTP Met';
    return 'Test in Progress';
  };

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const targetPower = useMemo(() => {
    if (testType === '20min') {
      const protocolPower = protocol?.calculatePower?.(goalFTP, elapsedSeconds);
      return protocolPower ?? goalFTP * 0.95;
    }
    const stage = Math.floor(elapsedSeconds / 60);
    return currentFTP * (stage < 5 ? 0.46 : 0.46 + 0.06 * (stage - 4));
  }, [testType, goalFTP, currentFTP, elapsedSeconds, protocol]);

  return (
    <div className={`test-screen ${darkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <h1>{testType === '20min' ? '20-Minute FTP Test' : 'Ramp FTP Test'}</h1>
        <button 
          onClick={toggleDarkMode}
          className="theme-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="power-display">
        <div className="power-value">
          {Math.round(targetPower)}
          <span className="power-unit">watts</span>
        </div>
        <div className="stage-indicator">
          {getStageText()}
        </div>
      </div>

      <div className="graph-container">
        <PowerGraph 
          currentFTP={currentFTP}
          goalFTP={goalFTP}
          testType={testType}
          elapsedSeconds={elapsedSeconds}
          protocol={protocol}
          darkMode={darkMode}
        />
      </div>

      <div className="timer-controls">
        <Timer 
          seconds={elapsedSeconds}
          isRunning={isRunning}
          onToggle={() => setIsRunning(!isRunning)}
          testType={testType}
          darkMode={darkMode}
        />
      </div>

      {/* Show End Test button for both test types */}
      <button 
        onClick={() => setIsRunning(false)}
        className="end-test-button"
      >
        End Test
      </button>
    </div>
  );
}