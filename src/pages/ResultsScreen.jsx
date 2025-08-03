import React from 'react';
import { X, Trophy, Zap, AlertTriangle } from 'lucide-react';
import './ResultsScreen.css';

const ResultsScreen = ({ 
  currentFTP, 
  elapsedSeconds, 
  testType, 
  calculatedFTP, 
  onClose, 
  onNewTest,
  darkMode
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate peak power (for ramp test) or average power (for 20min test)
  const peakPower = testType === 'ramp' 
    ? Math.round(calculatedFTP / 0.75) // Reverse calculate from FTP for ramp
    : Math.round(calculatedFTP / 0.95); // Reverse calculate from FTP for 20min

  // Calculate Peloton adjusted FTP
  const pelotonFTP = Math.round(calculatedFTP / 0.95);

  return (
    <div className={`results-modal-overlay ${darkMode ? 'dark' : 'light'}`}>
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
            <div className="peloton-data">
              <div className="results-grid-label">
                <AlertTriangle size={32} className="warning-icon" />
                Enter This Number in Your Peloton Settings
              </div>
              <div className="results-grid-value">{pelotonFTP}W</div>
              <div className="peloton-note">(Your FTP ÷ 0.95 because Peloton takes 95% of any entered value)</div>
            </div>
            <div>
              <div className="results-grid-label">Test Duration</div>
              <div className="results-grid-value">{formatTime(elapsedSeconds)}</div>
            </div>
            <div>
              <div className="results-grid-label">
                {testType === 'ramp' ? 'Peak Power' : 'Average Power'}
              </div>
              <div className="results-grid-value">{peakPower}W</div>
            </div>
          </div>
          <div className="results-note">
            {testType === 'ramp' 
              ? 'FTP calculated as 75% of your highest 60s average power'
              : 'FTP calculated as 95% of your 20-minute average power'}
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

export default ResultsScreen;