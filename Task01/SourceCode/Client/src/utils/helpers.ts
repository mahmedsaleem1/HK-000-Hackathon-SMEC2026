import { pollutantLimits } from '../types/pollution';

// get status based on pollutant value
export function getPollutantStatus(pollutantName: string, value: number): string {
  const limits = pollutantLimits[pollutantName];
  if (!limits) return 'unknown';

  if (value <= limits.good[1]) return 'good';
  if (value <= limits.fair[1]) return 'fair';
  if (value <= limits.moderate[1]) return 'moderate';
  if (value <= limits.poor[1]) return 'poor';
  return 'veryPoor';
}

// get color for status
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    good: '#4a9c6d',
    fair: '#8fb35a',
    moderate: '#d4a84b',
    poor: '#cf7c4a',
    veryPoor: '#b54d4d',
    unknown: '#888888'
  };
  return colorMap[status] || colorMap.unknown;
}

// get background tint for quality index
export function getQualityBackground(index: number): string {
  const backgrounds: Record<number, string> = {
    1: '#e8f5e9',
    2: '#f1f8e9',
    3: '#fff8e1',
    4: '#fff3e0',
    5: '#ffebee'
  };
  return backgrounds[index] || '#f5f5f5';
}

// format pollutant name for display
export function formatPollutantName(key: string): string {
  const nameMap: Record<string, string> = {
    sulphurDioxide: 'SO₂',
    nitrogenDioxide: 'NO₂',
    pm10: 'PM₁₀',
    pm25: 'PM₂.₅',
    ozone: 'O₃',
    carbonMonoxide: 'CO'
  };
  return nameMap[key] || key;
}

// get full pollutant name
export function getFullPollutantName(key: string): string {
  const fullNames: Record<string, string> = {
    sulphurDioxide: 'Sulphur Dioxide',
    nitrogenDioxide: 'Nitrogen Dioxide',
    pm10: 'Particulate Matter (10μm)',
    pm25: 'Fine Particles (2.5μm)',
    ozone: 'Ozone',
    carbonMonoxide: 'Carbon Monoxide'
  };
  return fullNames[key] || key;
}
