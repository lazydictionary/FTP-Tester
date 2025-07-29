import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  toggleDarkMode,
  onShowResults
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const powerHistory = useRef([]);

  // Store power output for each second
  useEffect(() => {
    if (isRunning) {
      const power = testType === '20min'
        ? protocol?.calculatePower?.(goalFTP, elapsedSeconds) ?? goalFTP * 0.95
        : (() => {
            const stage = Math.floor(elapsedSeconds / 60);
            return currentFTP * (stage < 5 ? 0.46 : 0.46 + 0.06 * (stage - 4));
          })();
      powerHistory.current.push(power);
    }
  }, [isRunning, elapsedSeconds, testType, goalFTP, currentFTP, protocol]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Calculate FTP
  const calculateFTP = () => {
    const history = powerHistory.current;
    if (testType === '20min') {
      // Use average power over the whole test
      const avg = history.reduce((a, b) => a + b, 0) / history.length || 0;
      return Math.round(avg * 0.95);
    } else {
      // Ramp test: find highest 60s average, then 75% of that
      let maxAvg = 0;
      for (let i = 0; i <= history.length - 60; i++) {
        const windowAvg = history.slice(i, i + 60).reduce((a, b) => a + b, 0) / 60;
        if (windowAvg > maxAvg) maxAvg = windowAvg;
      }
      return Math.round(maxAvg * 0.75);
    }
  };

  // Unified stage text for both test types
  const getStageText = () => {
    const minutes = elapsedSeconds / 60;
    if (minutes < 5) return 'Warmup Phase';
    if (minutes >= 19.5) return 'Current FTP Met';
    return 'Test in Progress';
  };

  const targetPower = useMemo(() => {
    if (testType === '20min') {
      const protocolPower = protocol?.calculatePower?.(goalFTP, elapsedSeconds);
      return protocolPower ?? goalFTP * 0.95;
    }
    const stage = Math.floor(elapsedSeconds / 60);
    return currentFTP * (stage < 5 ? 0.46 : 0.46 + 0.06 * (stage - 4));
  }, [testType, goalFTP, currentFTP, elapsedSeconds, protocol]);

  // Show results when test ends
  const handleEndTest = () => {
    setIsRunning(false);
    const calculatedFTP = calculateFTP();
    onShowResults({
      currentFTP,
      elapsedSeconds,
      testType,
      calculatedFTP,
    });
  };

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
        <button 
          onClick={handleEndTest}
          className="end-test-button"
        >
          End Test
        </button>
      </div>
    </div>
  );
}