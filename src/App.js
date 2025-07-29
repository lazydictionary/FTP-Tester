import React, { useState } from 'react';
import SetupScreen from './pages/SetupScreen';
import TestScreen from './pages/TestScreen';
import { TwentyMinTestProtocols } from './pages/TestProtocols';

function App() {
  const [testParams, setTestParams] = useState(null);

  return (
    <div className="app">
      {!testParams ? (
        <SetupScreen onStartTest={setTestParams} />
      ) : (
        <TestScreen 
          testType={testParams.testType}
          currentFTP={testParams.currentFTP}
          goalFTP={testParams.goalFTP}
          protocol={testParams.protocol || TwentyMinTestProtocols.STANDARD}
          warmup={testParams.warmup}
        />
      )}
    </div>
  );
}

export default App;