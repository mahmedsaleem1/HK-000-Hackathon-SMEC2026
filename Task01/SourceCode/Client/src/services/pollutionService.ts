import axios from 'axios';
import { ApiResponse } from '../types/pollution';

const serverUrl = 'http://localhost:5000/api/pollution';

// check air pollution for given location
export async function checkAirPollution(cityName: string): Promise<ApiResponse> {
  try {
    const response = await axios.post(`${serverUrl}/check`, {
      location: cityName
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error. Please check your connection.'
    };
  }
}

// fetch recent search history
export async function fetchSearchHistory() {
  try {
    const response = await axios.get(`${serverUrl}/history`);
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}
