import { useState, useCallback } from 'react';
import { GEOAPIFY_API_KEY } from '../config/api';

const LocationInput = ({ label, value, onChange, placeholder }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState(value?.address || '');
  const [isLoading, setIsLoading] = useState(false);

  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setSuggestions(data.features.map(f => ({
          address: f.properties.formatted,
          lat: f.properties.lat,
          lon: f.properties.lon
        })));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    searchLocation(val);
  };

  const handleSelect = (suggestion) => {
    setInputValue(suggestion.address);
    onChange(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="location-input">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="form-input"
        />
        {isLoading && <span className="loading-indicator">...</span>}
      </div>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((s, idx) => (
            <li key={idx} onClick={() => handleSelect(s)}>
              {s.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationInput;
