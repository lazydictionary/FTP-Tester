import React, { useState, useEffect } from 'react';
import { X, Trophy, Zap } from 'lucide-react';
import './ResultsScreen.css';

const RampTestApp = () => {
  const [currentWattage, setCurrentWattage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [currentFTP, setCurrentFTP] = useState(0);
  const [rampRate, setRampRate] = useState(0);

  useEffect(() => {
    let interval;
    if (isTestRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
        setCurrentWattage((prev) => prev + rampRate);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestRunning, rampRate]);

  const startTest = () => {
    setIsTestRunning(true);
    setElapsedTime(0);
    setCurrentWattage(Math.round(currentFTP * 0.46));
    setRampRate(Math.round(currentFTP * 0.46) / 20);
  };

  const endTest = () => {
    setIsTestRunning(false);
    setShowResults(true);
  };

  const resetTest = () => {
    setIsTestRunning(false);
    setElapsedTime(0);
    setCurrentWattage(0);
    setShowResults(false);
  };

  const calculateFTP = () => {
    // Dummy implementation, replace with actual FTP calculation logic
    return Math.round(currentWattage * 0.95);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ResultsScreen = ({ currentFTP, elapsedSeconds, testType, onClose, onNewTest }) => {
    const calculatedFTP = calculateFTP();
    const peakPower = currentWattage;

    return (
      <div className="results-modal-overlay">
        <div className="results-modal">
          <button onClick={onClose} className="results-modal-close" aria-label="Close">
            <X size={24} />
          </button>
          <div className="results-modal-content">
            <Trophy className="results-trophy" size={48} />
            <h2 className="results-title">Test Complete!</h2>
            <p className="results-subtitle">
              {testType === 'ramp' ? 'Your ramp test results' : 'Your 20-minute test results'}
            </p>
            <div className="results-ftp-box">
              <div className="results-ftp-label">
                <Zap className="results-ftp-icon" size={24} />
                Calculated FTP
              </div>
              <div className="results-ftp-value">{calculatedFTP}</div>
              <div className="results-ftp-units">watts</div>
            </div>
            <div className="results-grid">
              <div>
                <div className="results-grid-label">Test Duration</div>
                <div className="results-grid-value">{formatTime(elapsedSeconds)}</div>
              </div>
              <div>
                <div className="results-grid-label">Peak Power</div>
                <div className="results-grid-value">{peakPower}W</div>
              </div>
            </div>
            <div className="results-note">
              FTP calculated from average power of last 60 seconds
            </div>
            <div className="results-actions">
              {onNewTest && (
                <button className="results-btn" onClick={onNewTest}>
                  New Test
                </button>
              )}
              <button className="results-btn results-btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Ramp Test</h1>
        
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {currentWattage}
          </div>
          <div className="text-sm text-gray-500 mb-4">watts</div>
          
          <div className="text-2xl font-mono font-bold text-gray-800 mb-4">
            {formatTime(elapsedTime)}
          </div>
          
          <div className="text-sm text-gray-600">
            Starting: {Math.round(currentFTP * 0.46)}W | Ramp: +{Math.round(rampRate)}W/min
          </div>
        </div>
        
        <div className="flex gap-4">
          {!isTestRunning ? (
            <button 
              onClick={startTest}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Start Test
            </button>
          ) : (
            <button 
              onClick={endTest}
              className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              End Test
            </button>
          )}
          
          <button 
            onClick={resetTest}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
      
      {showResults && 
        <ResultsScreen 
          currentFTP={currentFTP} 
          elapsedSeconds={elapsedTime} 
          testType="ramp" 
          onClose={() => setShowResults(false)} 
          onNewTest={resetTest}
        />}
    </div>
  );
};

export default RampTestApp;