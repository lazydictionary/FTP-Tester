import { useState } from 'react';
import './SetupScreen.css';
import { TwentyMinTestProtocols} from './TestProtocols';

export default function SetupScreen({ onStartTest, darkMode, toggleDarkMode }) {
  const [currentFTP, setCurrentFTP] = useState(150);
  const [goalFTP, setGoalFTP] = useState(175);
  const [testType, setTestType] = useState('ramp');
  const [selectedProtocol, setSelectedProtocol] = useState(TwentyMinTestProtocols.STANDARD);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartTest({
      testType,
      currentFTP,
      goalFTP,
      protocol: testType === '20min' ? selectedProtocol : TwentyMinTestProtocols.STANDARD,
    });
  };

  return (
    <div className={`setup-container ${darkMode ? 'dark' : 'light'}`}>
      <div className="header">
        <h1>Select Your FTP Test</h1>
        <div className="button-group">
          <button className="info-page" onClick={() => window.open('https://github.com/lazydictionary/FTP-Tester', '_blank', 'noopener,noreferrer')}>
            ℹ️ 
          </button>
          <button className="theme-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
      
      <div className="test-options">
        <div 
          className={`test-card ${testType === 'ramp' ? 'active' : ''}`}
          onClick={() => setTestType('ramp')}
        >
          <h3>Ramp Test</h3>
          <p>• Based on your <strong>Current FTP</strong></p>
          <p>• Uses 75% of best minute of output</p>
          <p>• Gradually ramp in difficulty</p>
          <p>• Recommended for beginners</p>
        </div>
        <div 
          className={`test-card ${testType === '20min' ? 'active' : ''}`}
          onClick={() => setTestType('20min')}
        >
          <h3>20-Minute Test</h3>
          <p>• Based on your <strong>Goal FTP</strong> </p>
          <p>• Uses 95% of your average wattage</p>
          <p>• Choice of constant or interval output</p>
          <p>• Best for experienced cyclists</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ftp-form">
        {testType === 'ramp' && (
          <>
            <label>
            Current FTP (Watts):
            <input
              type="number"
              value={currentFTP}
              onChange={(e) => setCurrentFTP(Number(e.target.value))}
              min="1"
              max="999"
              required
            />
          </label>
          </>
        )}

        {testType === '20min' && (
          <>
            <label>
              Goal FTP (Watts):
              <input
                type="number"
                value={goalFTP}
                onChange={(e) => setGoalFTP(Number(e.target.value))}
                min='1'
                max="999"
                required
              />
            </label>

            <div className="setup-options">
              <h3>20-Minute Test Options</h3>
              <div className="protocol-options">
                {Object.values(TwentyMinTestProtocols).map(protocol => (
                  <div 
                    key={protocol.name}
                    className={`protocol-card ${selectedProtocol.name === protocol.name ? 'active' : ''}`}
                    onClick={() => setSelectedProtocol(protocol)}
                  >
                    <h4>{protocol.name}</h4>
                    <p>{protocol.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button type="submit" className="start-button">
          Start {testType === '20min' ? '20-Minute' : 'Ramp'} Test
        </button>
      </form>
    </div>
  );
}