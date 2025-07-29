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
          protocol={testParams.protocol || TwentyMinTestProtocols.STANDARD} // Fallback
          warmup={testParams.warmup}
        />
      )}
    </div>
  );
}