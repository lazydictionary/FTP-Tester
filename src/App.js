import React, { useState } from 'react';
import SetupScreen from './pages/SetupScreen';
import TestScreen from './pages/TestScreen';
import ResultsScreen from './pages/ResultsScreen';
//import { TwentyMinTestProtocols } from './pages/TestProtocols';

function App() {
  const [testParams, setTestParams] = useState(null);
  const [resultsParams, setResultsParams] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // When test ends, call this to show results
  const handleShowResults = (results) => {
    setResultsParams(results);
    setTestParams(null); // Optionally reset testParams
  };

  // When results are closed, reset resultsParams
  const handleCloseResults = () => setResultsParams(null);

  return (
    <>
      {!testParams && !resultsParams ? (
        <SetupScreen 
          onStartTest={setTestParams} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      ) : testParams ? (
        <TestScreen 
          {...testParams}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onShowResults={handleShowResults} // Pass this to TestScreen
        />
      ) : (
        <ResultsScreen
          {...resultsParams}
          onClose={handleCloseResults}
          onNewTest={() => {
            setResultsParams(null);
            setTestParams(null);
          }}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </>
  );
}

export default App;