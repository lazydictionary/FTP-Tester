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
    //if (elapsedSeconds < 300) { // Less than 5 minutes (warmup phase)
    //  return 0; // Test not valid yet
    //}

    // Calculate the exact minute value including fractions
    const exactMinute = elapsedSeconds / 60;
    
    // Get the current stage (integer minute)
    const currentStage = Math.floor(exactMinute);
    
    // Calculate power at current minute
    const highTestValue = currentFTP * (currentStage < 5 ? 0.46 : 0.46 + 0.06 * (currentStage - 4));
    
    // Calculate power at previous minute
    const prevStage = currentStage - 1;
    const lowTestValue = currentFTP * (prevStage < 5 ? 0.46 : 0.46 + 0.06 * (prevStage - 4));
    
    // Calculate weighted average based on how far into the current minute we are
    const minuteFraction = exactMinute - currentStage;
    const currentPower = (lowTestValue * (1 - minuteFraction)) + (highTestValue * minuteFraction);
    
    // For ramp test: 75% of the last completed minute's power
    // (or average of last 60 seconds if we have the data)
    if (history.length >= 60) {
      const last60Seconds = history.slice(-60);
      const avgPower = last60Seconds.reduce((sum, power) => sum + power, 0) / 60;
      return Math.round(avgPower * 0.75);
    } else {
      // Fallback calculation if we don't have full 60 seconds of data
      return Math.round(currentPower * 0.75);
    }
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
    setShowConfetti(true);
    setConfettiActive(true); // Start spawning confetti
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