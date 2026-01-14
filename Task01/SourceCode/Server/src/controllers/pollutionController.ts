import { Request, Response } from 'express';
import axios from 'axios';
import SearchHistory from '../models/SearchHistory';

const weatherApiKey = process.env.WEATHER_API_KEY;

// helper to determine quality label from index
function getQualityLabel(index: number): string {
  const labels: Record<number, string> = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor'
  };
  return labels[index] || 'Unknown';
}

// get coordinates from city name
async function fetchCityCoordinates(cityName: string) {
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${weatherApiKey}`;
  
  const response = await axios.get(geoUrl);
  
  if (response.data && response.data.length > 0) {
    const place = response.data[0];
    return {
      lat: place.lat,
      lon: place.lon,
      name: place.name,
      country: place.country
    };
  }
  return null;
}

// fetch pollution data from coordinates
async function fetchPollutionData(lat: number, lon: number) {
  const pollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${weatherApiKey}`;
  
  const response = await axios.get(pollutionUrl);
  return response.data;
}

// main controller to check pollution by location
export const checkPollution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location } = req.body;
    
    if (!location || location.trim() === '') {
      res.status(400).json({ 
        success: false, 
        message: 'Please provide a location' 
      });
      return;
    }

    // get coordinates first
    const coordinates = await fetchCityCoordinates(location);
    
    if (!coordinates) {
      res.status(404).json({ 
        success: false, 
        message: 'Location not found. Please try another city name.' 
      });
      return;
    }

    // fetch pollution info
    const pollutionInfo = await fetchPollutionData(coordinates.lat, coordinates.lon);
    
    if (!pollutionInfo || !pollutionInfo.list || pollutionInfo.list.length === 0) {
      res.status(500).json({ 
        success: false, 
        message: 'Could not fetch pollution data' 
      });
      return;
    }

    const currentData = pollutionInfo.list[0];
    const aqiValue = currentData.main.aqi;
    const components = currentData.components;

    const pollutantValues = {
      sulphurDioxide: components.so2,
      nitrogenDioxide: components.no2,
      pm10: components.pm10,
      pm25: components.pm2_5,
      ozone: components.o3,
      carbonMonoxide: components.co
    };

    // save to database
    const searchEntry = new SearchHistory({
      cityName: `${coordinates.name}, ${coordinates.country}`,
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      airQualityIndex: aqiValue,
      qualityLabel: getQualityLabel(aqiValue),
      pollutants: pollutantValues
    });

    await searchEntry.save();

    // send response
    res.json({
      success: true,
      data: {
        location: `${coordinates.name}, ${coordinates.country}`,
        coordinates: {
          latitude: coordinates.lat,
          longitude: coordinates.lon
        },
        airQuality: {
          index: aqiValue,
          label: getQualityLabel(aqiValue)
        },
        pollutants: pollutantValues,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.log('Error checking pollution:', error.message);
    
    // check if it's an API key issue
    if (error.response && error.response.status === 401) {
      res.status(500).json({ 
        success: false, 
        message: 'API key issue. New keys take up to 2 hours to activate on OpenWeatherMap.' 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Something went wrong. Please try again.' 
    });
  }
};

// get recent searches
export const getRecentSearches = async (req: Request, res: Response): Promise<void> => {
  try {
    const recentRecords = await SearchHistory.find()
      .sort({ searchedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: recentRecords
    });
  } catch (error: any) {
    console.log('Error fetching history:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Could not fetch search history' 
    });
  }
};
