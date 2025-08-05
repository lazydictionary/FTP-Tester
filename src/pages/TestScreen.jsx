import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import PowerGraph from '../components/PowerGraph';
import Timer from '../components/Timer';
import CountdownOverlay from '../components/CountdownOverlay';
import './TestScreen.css';

export default function TestScreen({ 
  testType, 
  currentFTP, 
  goalFTP, 
  protocol = null,
  rampTestPercentage = 0.72,
  darkMode,
  toggleDarkMode,
  onShowResults,
  setShowConfetti,
  setConfettiActive,
  onBackToSetup
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const powerHistory = useRef([]);
  const audioContextRef = useRef(null);
  const lastFlashState = useRef(false);

  // Audio generation functions
  const createAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playBeep = useCallback((frequency = 800, duration = 200, volume = 0.5) => {
    try {
      const audioContext = createAudioContext();
      
      // Resume audio context if it's suspended (required by browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [createAudioContext]);

  const playWarningChime = useCallback(() => {
    // Play a distinctive two-tone chime (last number is volume)
    playBeep(600, 150, 0.4);
    setTimeout(() => playBeep(800, 150, 0.4), 160);
  }, [playBeep]);

  const playCountdownBeep = useCallback((secondsRemaining) => {
    if (secondsRemaining === 1) {
      // Final beep - higher pitch and longer
      playBeep(1000, 300, 0.6);
    } else {
      // Regular countdown beeps
      playBeep(600, 100, 0.4);
    }
  }, [playBeep]);

  // Function to determine if we should flash based on upcoming power changes
  const { shouldFlash, secondsUntilChange } = useMemo(() => {
    if (!isRunning) return { shouldFlash: false, secondsUntilChange: null };

    if (testType === 'ramp') {   
      // Before the first change at 5:00, check if we're close
      if (elapsedSeconds < 300) {
        const timeUntilFirstChange = 300 - elapsedSeconds;
        return {
          shouldFlash: timeUntilFirstChange <= 5 && timeUntilFirstChange > 0,
          secondsUntilChange: timeUntilFirstChange <= 5 ? timeUntilFirstChange : null
        };
      }
      
      // After 5:00, changes happen every 60 seconds
      const secondsSinceFirstChange = elapsedSeconds - 300;
      const timeSinceLastChange = secondsSinceFirstChange % 60;
      const timeUntilNext = 60 - timeSinceLastChange;
      
      // Flash for 5 seconds before each minute change
      return {
        shouldFlash: timeUntilNext <= 5 && timeUntilNext > 0,
        secondsUntilChange: timeUntilNext <= 5 ? timeUntilNext : null
      };
    } else {
      // 20-minute test: changes every 5 minutes (300 seconds)
      const timeUntilNextChange = 300 - (elapsedSeconds % 300);
      
      // Flash for 5 seconds before each 5-minute change
      return {
        shouldFlash: timeUntilNextChange <= 5 && timeUntilNextChange > 0,
        secondsUntilChange: timeUntilNextChange <= 5 ? timeUntilNextChange : null
      };
    }
  }, [elapsedSeconds, isRunning, testType]);

  // Handle flashing state and audio cues
  useEffect(() => {
    const wasFlashing = lastFlashState.current;
    const isNowFlashing = shouldFlash;
    
    setIsFlashing(isNowFlashing);
    
    // Play audio cues when flashing starts or during countdown
    if (isNowFlashing && secondsUntilChange !== null) {
      if (!wasFlashing) {
        // First time entering flash state - play warning chime
        playWarningChime();
      } else {
        // During countdown
        playCountdownBeep(secondsUntilChange);
      }
    }
    
    lastFlashState.current = isNowFlashing;
  }, [shouldFlash, secondsUntilChange, playWarningChime, playCountdownBeep]);

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
        return Math.round(avgPower * rampTestPercentage);
      } else {
        return Math.round(currentPower * rampTestPercentage);
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
    
    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setShowConfetti(true);
    setConfettiActive(true);
    const calculatedFTP = calculateFTP();
    onShowResults({
      currentFTP,
      elapsedSeconds,
      testType,
      calculatedFTP,
      peakPower: testType === 'ramp' 
        ? calculatedFTP / rampTestPercentage 
        : calculatedFTP / 0.95
    });
    
    // Stop spawning new confetti after 10 seconds
    setTimeout(() => setConfettiActive(false), 10000);
    // Hide confetti overlay after 15 seconds
    setTimeout(() => setShowConfetti(false), 15000);
  };

  const handleBackClick = () => {
    // Clean up audio context when leaving
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (onBackToSetup) {
      onBackToSetup();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`test-screen ${darkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <h1>{testType === '20min' ? '20-Minute FTP Test' : 'Ramp FTP Test'}</h1>
        <div className="button-group">
          <button 
            className="back-button"
            onClick={handleBackClick}
            aria-label="Back to setup"
          >
            ⬅️
          </button>
          <button 
            className="info-page" 
            onClick={() => window.open('https://github.com/lazydictionary/FTP-Tester', '_blank', 'noopener,noreferrer')}
          >
            ℹ️
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="top-row">
        <div className={`power-display ${isFlashing ? 'flashing' : ''}`}>
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

      <CountdownOverlay 
        isVisible={shouldFlash}
        secondsRemaining={secondsUntilChange}
        darkMode={darkMode}
        testType={testType}
      />
    </div>
  );
}