import { useState } from 'react';
import SetupScreen from './pages/SetupScreen';
import TestScreen from './pages/TestScreen';

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
        />
      )}
    </div>
  );
}

export default App;