import React, { useState, useEffect, useMemo, useRef } from 'react';
import PowerGraph from '../components/PowerGraph';
import Timer from '../components/Timer';
import './TestScreen.css';

export default function TestScreen({ 
  testType, 
  currentFTP, 
  goalFTP, 
  protocol = null,
  darkMode,
  toggleDarkMode,
  onShowResults,
  setShowConfetti,
  setConfettiActive // <-- Add this prop
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
  // In TestScreen.jsx - update your calculateFTP function:
const calculateFTP = () => {
  const history = powerHistory.current;
  
  if (testType === '20min') {
    // For 20min test, just return the goal FTP
    return goalFTP;
  } else {
    // Ramp test calculation
    if (elapsedSeconds < 300) {
      return 0;
    }

    const exactMinute = elapsedSeconds / 60;
    const currentStage = Math.floor(exactMinute);
    const highTestValue = currentFTP * (currentStage < 5 ? 0.46 : 0.46 + 0.06 * (currentStage - 4));
    const prevStage = currentStage - 1;
    const lowTestValue = currentFTP * (prevStage < 5 ? 0.46 : 0.46 + 0.06 * (prevStage - 4));
    const minuteFraction = exactMinute - currentStage;
    const currentPower = (lowTestValue * (1 - minuteFraction)) + (highTestValue * minuteFraction);
    
    if (history.length >= 60) {
      const last60Seconds = history.slice(-60);
      const avgPower = last60Seconds.reduce((sum, power) => sum + power, 0) / 60;
      return Math.round(avgPower * 0.75);
    } else {
      return Math.round(currentPower * 0.75);
    }
  }
  };

  const targetPower = useMemo(() => {
    if (testType === '20min') {
      const protocolPower = protocol?.calculatePower?.(goalFTP, elapsedSeconds);
      return protocolPower ?? goalFTP * 0.95;
    }
    const stage = Math.floor(elapsedSeconds / 60);
    return currentFTP * (stage < 5 ? 0.46 : 0.46 + 0.06 * (stage - 4));
  }, [testType, goalFTP, currentFTP, elapsedSeconds, protocol]);

  const handleEndTest = () => {
    setIsRunning(false);
    setShowConfetti(true);
    setConfettiActive(true);
    const calculatedFTP = calculateFTP();
    onShowResults({
      currentFTP,
      elapsedSeconds,
      testType,
      calculatedFTP,
      peakPower: testType === 'ramp' ? calculatedFTP / 0.75 : calculatedFTP / 0.95
    });
    // Stop spawning new confetti after 10 seconds, but let existing pieces fall
    setTimeout(() => setConfettiActive(false), 10000);
    // Hide confetti overlay after a bit longer (e.g., 15s)
    setTimeout(() => setShowConfetti(false), 15000);
  };

  return (
    <div className={`test-screen ${darkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <h1>{testType === '20min' ? '20-Minute FTP Test' : 'Ramp FTP Test'}</h1>
        <div className="button-group">
          <button className="info-page" onClick={() => window.open('https://github.com/lazydictionary/FTP-Tester', '_blank', 'noopener,noreferrer')}>
            🛈
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div> 

      <div className="top-row">
        <div className="power-display">
          <div className="power-value">
            {Math.round(targetPower)}
            <span className="power-unit">Watts</span>
          </div>
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
    </div>
  );
}