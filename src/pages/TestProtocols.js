export const TwentyMinTestProtocols = {
  STANDARD: {
    name: "Standard",
    description: "Constant power at Goal FTP",
    calculatePower: (goalFTP, elapsed) => goalFTP / 0.95
  },
  DESCENDING: {
    name: "Descending Intervals",
    description: "Starts at 107.5% FTP, decreases 5% every 5 minutes",
    calculatePower: (goalFTP, elapsed) => {
      const segment = Math.floor(elapsed / 300);
      return goalFTP / 0.95 * (1.075 - (segment * 0.05));
    }
  },
  ASCENDING: {
    name: "Ascending Intervals",
    description: "Starts at 92.5% FTP, increases 5% every 5 minutes",
    calculatePower: (goalFTP, elapsed) => {
      const segment = Math.floor(elapsed / 300);
      return goalFTP / 0.95 * (0.925 + (segment * 0.05));
    }
  }
};