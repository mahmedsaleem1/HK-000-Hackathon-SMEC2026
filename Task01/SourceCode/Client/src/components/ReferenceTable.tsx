import React from 'react';

function ReferenceTable() {
  const tableData = [
    { level: 'Good', idx: 1, so2: '0-20', no2: '0-40', pm10: '0-20', pm25: '0-10', o3: '0-60', co: '0-4400' },
    { level: 'Fair', idx: 2, so2: '20-80', no2: '40-70', pm10: '20-50', pm25: '10-25', o3: '60-100', co: '4400-9400' },
    { level: 'Moderate', idx: 3, so2: '80-250', no2: '70-150', pm10: '50-100', pm25: '25-50', o3: '100-140', co: '9400-12400' },
    { level: 'Poor', idx: 4, so2: '250-350', no2: '150-200', pm10: '100-200', pm25: '50-75', o3: '140-180', co: '12400-15400' },
    { level: 'Very Poor', idx: 5, so2: '>350', no2: '>200', pm10: '>200', pm25: '>75', o3: '>180', co: '>15400' }
  ];

  const rowColors: Record<number, string> = {
    1: '#f0f9f4',
    2: '#f5f9ed',
    3: '#fdf8e8',
    4: '#fdf4eb',
    5: '#fceeed'
  };

  return (
    <div style={styles.container}>
      <h4 style={styles.title}>Reference: Pollutant Concentration Ranges (μg/m³)</h4>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>Quality</th>
              <th style={styles.headerCell}>Index</th>
              <th style={styles.headerCell}>SO₂</th>
              <th style={styles.headerCell}>NO₂</th>
              <th style={styles.headerCell}>PM₁₀</th>
              <th style={styles.headerCell}>PM₂.₅</th>
              <th style={styles.headerCell}>O₃</th>
              <th style={styles.headerCell}>CO</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row.idx} style={{ backgroundColor: rowColors[row.idx] }}>
                <td style={styles.bodyCell}>{row.level}</td>
                <td style={{ ...styles.bodyCell, fontWeight: 600 }}>{row.idx}</td>
                <td style={styles.bodyCell}>{row.so2}</td>
                <td style={styles.bodyCell}>{row.no2}</td>
                <td style={styles.bodyCell}>{row.pm10}</td>
                <td style={styles.bodyCell}>{row.pm25}</td>
                <td style={styles.bodyCell}>{row.o3}</td>
                <td style={styles.bodyCell}>{row.co}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '40px',
    padding: '20px',
    backgroundColor: '#fafafa',
    borderRadius: '12px'
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '14px',
    fontWeight: 500,
    color: '#666',
    textAlign: 'center' as const
  },
  tableWrapper: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '13px'
  },
  headerRow: {
    backgroundColor: '#e8e8e8'
  },
  headerCell: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    fontWeight: 600,
    color: '#444',
    borderBottom: '2px solid #ddd'
  },
  bodyCell: {
    padding: '10px 8px',
    textAlign: 'center' as const,
    color: '#555',
    borderBottom: '1px solid #eee'
  }
};

export default ReferenceTable;
