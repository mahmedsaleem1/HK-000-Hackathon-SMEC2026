// pollution data types
export interface PollutantLevels {
  sulphurDioxide: number;
  nitrogenDioxide: number;
  pm10: number;
  pm25: number;
  ozone: number;
  carbonMonoxide: number;
}

export interface AirQualityInfo {
  index: number;
  label: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface PollutionResult {
  location: string;
  coordinates: LocationCoords;
  airQuality: AirQualityInfo;
  pollutants: PollutantLevels;
  timestamp: string;
}

export interface ApiResponse {
  success: boolean;
  data?: PollutionResult;
  message?: string;
}

// threshold values for pollution levels
export interface PollutantThreshold {
  good: [number, number];
  fair: [number, number];
  moderate: [number, number];
  poor: [number, number];
  veryPoor: [number, number];
}

export const pollutantLimits: Record<string, PollutantThreshold> = {
  sulphurDioxide: {
    good: [0, 20],
    fair: [20, 80],
    moderate: [80, 250],
    poor: [250, 350],
    veryPoor: [350, 999]
  },
  nitrogenDioxide: {
    good: [0, 40],
    fair: [40, 70],
    moderate: [70, 150],
    poor: [150, 200],
    veryPoor: [200, 999]
  },
  pm10: {
    good: [0, 20],
    fair: [20, 50],
    moderate: [50, 100],
    poor: [100, 200],
    veryPoor: [200, 999]
  },
  pm25: {
    good: [0, 10],
    fair: [10, 25],
    moderate: [25, 50],
    poor: [50, 75],
    veryPoor: [75, 999]
  },
  ozone: {
    good: [0, 60],
    fair: [60, 100],
    moderate: [100, 140],
    poor: [140, 180],
    veryPoor: [180, 999]
  },
  carbonMonoxide: {
    good: [0, 4400],
    fair: [4400, 9400],
    moderate: [9400, 12400],
    poor: [12400, 15400],
    veryPoor: [15400, 99999]
  }
};
