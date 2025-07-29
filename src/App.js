import React, { useState } from 'react';
import SetupScreen from './pages/SetupScreen';
import TestScreen from './pages/TestScreen';
import { TwentyMinTestProtocols } from './pages/TestProtocols';

function App() {
  const [testParams, setTestParams] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <>
      {!testParams ? (
        <SetupScreen 
          onStartTest={setTestParams} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      ) : (
        <TestScreen 
          testType={testParams.testType}
          currentFTP={testParams.currentFTP}
          goalFTP={testParams.goalFTP}
          protocol={testParams.protocol || TwentyMinTestProtocols.STANDARD}
          warmup={testParams.warmup}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </>
  );
}

export default App;