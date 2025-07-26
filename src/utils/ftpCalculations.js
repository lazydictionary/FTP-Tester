export function calculate20MinFTP(averagePower) {
  return Math.round(averagePower * 0.95);
}

export function getPowerZone(ftp, currentPower) {
  const percentage = (currentPower / ftp) * 100;
  if (percentage < 55) return 'Recovery';
  if (percentage < 75) return 'Endurance';
  if (percentage < 90) return 'Tempo';
  if (percentage < 105) return 'Threshold';
  if (percentage < 120) return 'VO2 Max';
  return 'Anaerobic';
}