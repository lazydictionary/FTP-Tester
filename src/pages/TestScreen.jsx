import React, { useState, useEffect, useMemo } from 'react';
import Timer from '../components/Timer';
import PowerGraph from '../components/PowerGraph';
import './TestScreen.css';

export default function TestScreen({ testType, currentFTP, goalFTP }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const getStageText = () => {
    const minutes = elapsedSeconds / 60;
    
    if (testType === '20min') {
      if (minutes >= 19.5) return 'Current FTP Met';
      return 'Test';
    } else {
      if (minutes < 5) return 'Warmup';
      if (minutes >= 19.5) return 'Current FTP Met';
      return 'Test';
    }
  };

  // Simple timer implementation
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Memoized power calculation
  const targetPower = useMemo(() => {
    if (testType === '20min') return goalFTP * 0.95;
    const stage = Math.floor(elapsedSeconds / 60);
    return currentFTP * (stage < 5 ? 0.46 : 0.46 + 0.06 * (stage - 4));
  }, [testType, goalFTP, currentFTP, elapsedSeconds]);

  return (
    <div className="test-screen">
      <div className="power-display">
        <div className="power-value">
          {Math.round(targetPower)} <span>watts</span>
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
        />
      </div>

      <div className="timer-controls">
        <Timer 
          seconds={elapsedSeconds}
          isRunning={isRunning}
          onToggle={() => setIsRunning(!isRunning)}
          testType={testType}
        />
      </div>

      {testType === 'ramp' && (
        <button 
          onClick={() => setIsRunning(false)}
          className="end-test-button" // Changed class name
        >
          End Test
        </button>
      )}
    </div>
  );
}