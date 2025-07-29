export const TwentyMinTestProtocols = {
  STANDARD: {
    name: "Standard",
    description: "Constant power at Goal FTP",
    calculatePower: (goalFTP, elapsed) => goalFTP / 0.95
  },
  DESCENDING: {
    name: "Descending Intervals",
    description: "Starts at 110% FTP, decreases every 5 minutes",
    calculatePower: (goalFTP, elapsed) => {
      const segment = Math.floor(elapsed / 300);
      return goalFTP / 0.95 * (1.10 - (segment * 0.05));
    }
  },
  ASCENDING: {
    name: "Ascending Intervals",
    description: "Starts at 90% FTP, increases every 5 minutes",
    calculatePower: (goalFTP, elapsed) => {
      const segment = Math.floor(elapsed / 300);
      return goalFTP / 0.95 * (0.9 + (segment * 0.05));
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