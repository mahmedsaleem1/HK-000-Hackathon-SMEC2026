import React from 'react';
import { getQualityBackground } from '../utils/helpers';

interface QualityBadgeProps {
  index: number;
  label: string;
  location: string;
}

function QualityBadge({ index, label, location }: QualityBadgeProps) {
  
  const badgeColors: Record<number, string> = {
    1: '#4a9c6d',
    2: '#8fb35a',
    3: '#d4a84b',
    4: '#cf7c4a',
    5: '#b54d4d'
  };

  const badgeColor = badgeColors[index] || '#666';
  const bgTint = getQualityBackground(index);

  return (
    <div style={{ ...styles.card, backgroundColor: bgTint }}>
      <h3 style={styles.locationText}>{location}</h3>
      <div style={styles.indexWrapper}>
        <div style={{ ...styles.indexCircle, borderColor: badgeColor }}>
          <span style={{ ...styles.indexNumber, color: badgeColor }}>{index}</span>
        </div>
        <div style={styles.labelSection}>
          <span style={styles.qualityTitle}>Air Quality Index</span>
          <span style={{ ...styles.qualityLabel, color: badgeColor }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    padding: '24px',
    borderRadius: '12px',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  locationText: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: 500,
    color: '#333'
  },
  indexWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px'
  },
  indexCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    border: '4px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  indexNumber: {
    fontSize: '28px',
    fontWeight: 600
  },
  labelSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start'
  },
  qualityTitle: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px'
  },
  qualityLabel: {
    fontSize: '22px',
    fontWeight: 600
  }
};

export default QualityBadge;
