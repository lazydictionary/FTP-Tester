export const TwentyMinTestProtocols = {
  STANDARD: {
    name: "Standard (95% FTP)",
    description: "Constant power at 95% of goal FTP",
    calculatePower: (goalFTP, elapsed) => goalFTP * 0.95
  },
  DESCENDING: {
    name: "Descending Intervals",
    description: "Starts at 105% FTP, decreases every 5 minutes",
    calculatePower: (goalFTP, elapsed) => {
      const segment = Math.floor(elapsed / 300);
      return goalFTP * (1.05 - (segment * 0.05));
    }
  }
};

export const WarmupProtocols = {
  STANDARD: {
    name: "Standard Warmup",
    steps: [
      { duration: 600, power: 0.5 },
      { duration: 300, power: 0.7 },
      { duration: 120, power: 0.9 }
    ]
  }
};