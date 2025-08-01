import React, { useState, useEffect } from 'react';
import SetupScreen from './pages/SetupScreen';
import TestScreen from './pages/TestScreen';
import ResultsScreen from './pages/ResultsScreen';

function App() {
  const [testParams, setTestParams] = useState(null);
  const [resultsParams, setResultsParams] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

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
        // This fallback shouldn't be needed now since we're using modal approach
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