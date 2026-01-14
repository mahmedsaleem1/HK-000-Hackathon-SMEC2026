import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import QualityBadge from './components/QualityBadge';
import PollutantGrid from './components/PollutantGrid';
import ReferenceTable from './components/ReferenceTable';
import { checkAirPollution } from './services/pollutionService';
import { PollutionResult } from './types/pollution';

function App() {
  const [cityInput, setCityInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pollutionData, setPollutionData] = useState<PollutionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async () => {
    if (!cityInput.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    setPollutionData(null);

    const result = await checkAirPollution(cityInput.trim());

    if (result.success && result.data) {
      setPollutionData(result.data);
    } else {
      setErrorMsg(result.message || 'Could not fetch data. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.mainContainer}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.mainTitle}>Air Quality Checker</h1>
          <p style={styles.subtitle}>
            Check real-time air pollution levels for any city worldwide
          </p>
        </header>

        {/* Search Section */}
        <SearchBox
          inputValue={cityInput}
          onInputChange={setCityInput}
          onSearch={handleSearch}
          isSearching={isLoading}
        />

        {/* Error Display */}
        {errorMsg && (
          <div style={styles.errorBox}>
            {errorMsg}
          </div>
        )}

        {/* Results Section */}
        {pollutionData && (
          <div style={styles.resultsArea}>
            <QualityBadge
              index={pollutionData.airQuality.index}
              label={pollutionData.airQuality.label}
              location={pollutionData.location}
            />
            <PollutantGrid pollutants={pollutionData.pollutants} />
          </div>
        )}

        {/* Reference Table */}
        <ReferenceTable />

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            Data provided by OpenWeatherMap Air Pollution API
          </p>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    backgroundColor: '#f5f6f8',
    padding: '40px 20px',
    fontFamily: 'Inter, -apple-system, sans-serif',
    boxSizing: 'border-box' as const
  },
  mainContainer: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '32px'
  },
  mainTitle: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 600,
    color: '#2c3e50'
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#666'
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    color: '#c53030',
    padding: '14px 20px',
    borderRadius: '8px',
    marginBottom: '24px',
    textAlign: 'center' as const,
    fontSize: '14px'
  },
  resultsArea: {
    marginBottom: '24px'
  },
  footer: {
    marginTop: '32px',
    textAlign: 'center' as const
  },
  footerText: {
    margin: 0,
    fontSize: '12px',
    color: '#999'
  }
};

export default App;
