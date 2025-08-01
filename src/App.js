import React, { useState, useEffect } from 'react';
import SetupScreen from './pages/SetupScreen';
import TestScreen from './pages/TestScreen';
import ResultsScreen from './pages/ResultsScreen';
import ConfettiOverlay from './components/ConfettiOverlay';

function App() {
  const [testParams, setTestParams] = useState(null);
  const [resultsParams, setResultsParams] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);

    // Toggle body class
    document.body.classList.toggle('dark', newMode);

    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  // Initialize on first load
  useEffect(() => {
    const savedMode = JSON.parse(localStorage.getItem('darkMode'));
    if (savedMode) {
      setDarkMode(savedMode);
      document.body.classList.toggle('dark', savedMode);
    }
  }, []);

  useEffect(() => {
    if (showResults) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showResults]);

  const handleShowResults = (results) => {
    setResultsParams(results);
    setShowResults(true);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const handleNewTest = () => {
    setShowResults(false);
    setTestParams(null);
    setResultsParams(null);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <ConfettiOverlay show={showConfetti} numberOfPieces={confettiActive ? 200 : 0} />
      {!testParams && !resultsParams ? (
        <SetupScreen
          onStartTest={setTestParams}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      ) : testParams ? (
        <>
          <TestScreen
            {...testParams}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onShowResults={handleShowResults}
            setShowConfetti={setShowConfetti}
            setConfettiActive={setConfettiActive}
          />
          {showResults && resultsParams && (
            <ResultsScreen
              {...resultsParams}
              onClose={handleCloseResults}
              onNewTest={handleNewTest}
              darkMode={darkMode}
            />
          )}
        </>
      ) : (
        <ResultsScreen
          {...resultsParams}
          onClose={handleCloseResults}
          onNewTest={handleNewTest}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;