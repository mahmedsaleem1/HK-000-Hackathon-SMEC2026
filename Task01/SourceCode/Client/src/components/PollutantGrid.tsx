import React from 'react';
import { PollutantLevels } from '../types/pollution';
import { 
  getPollutantStatus, 
  getStatusColor, 
  formatPollutantName,
  getFullPollutantName 
} from '../utils/helpers';

interface PollutantGridProps {
  pollutants: PollutantLevels;
}

function PollutantGrid({ pollutants }: PollutantGridProps) {
  
  const pollutantEntries = Object.entries(pollutants);

  return (
    <div style={styles.container}>
      <h4 style={styles.heading}>Pollutant Concentrations (μg/m³)</h4>
      <div style={styles.grid}>
        {pollutantEntries.map(([key, value]) => {
          const status = getPollutantStatus(key, value);
          const indicatorColor = getStatusColor(status);
          
          return (
            <div key={key} style={styles.pollutantCard}>
              <div style={styles.cardTop}>
                <span style={styles.symbol}>{formatPollutantName(key)}</span>
                <span 
                  style={{ ...styles.statusDot, backgroundColor: indicatorColor }}
                  title={status}
                />
              </div>
              <span style={styles.valueText}>{value.toFixed(1)}</span>
              <span style={styles.nameText}>{getFullPollutantName(key)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '8px'
  },
  heading: {
    margin: '0 0 16px 0',
    fontSize: '15px',
    fontWeight: 500,
    color: '#555',
    textAlign: 'center' as const
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px'
  },
  pollutantCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid #eee',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  symbol: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#3d5a80'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  valueText: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#333',
    marginBottom: '4px'
  },
  nameText: {
    fontSize: '11px',
    color: '#888',
    textAlign: 'center' as const
  }
};

export default PollutantGrid;
