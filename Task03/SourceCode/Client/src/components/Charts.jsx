/**
 * Charts Component
 * Basic chart implementations for data visualization
 */

import '../styles/Charts.css';

/**
 * Simple Line Chart for trends
 */
export function LineChart({ data }) {
  if (!data || data.length === 0) return <div className="chart">No data available</div>;

  const maxValue = Math.max(...data.map(d => d.spending || 0), 1); // Ensure at least 1 to avoid division by zero
  const chartHeight = 300;
  const chartPadding = 40;
  const chartWidth = Math.max(data.length * 40, 400);

  return (
    <div className="chart line-chart">
      <svg width={chartWidth} height={chartHeight + chartPadding * 2} viewBox={`0 0 ${chartWidth} ${chartHeight + chartPadding * 2}`}>
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={`grid-${ratio}`}
            x1={chartPadding}
            y1={chartPadding + (1 - ratio) * chartHeight}
            x2={chartWidth - chartPadding}
            y2={chartPadding + (1 - ratio) * chartHeight}
            className="grid-line"
          />
        ))}

        {/* Y-axis */}
        <line x1={chartPadding} y1={chartPadding} x2={chartPadding} y2={chartHeight + chartPadding} className="axis" />
        
        {/* X-axis */}
        <line x1={chartPadding} y1={chartHeight + chartPadding} x2={chartWidth - chartPadding} y2={chartHeight + chartPadding} className="axis" />

        {/* Data Line */}
        <polyline
          points={data
            .map((d, i) => {
              const x = chartPadding + (i / Math.max(data.length - 1, 1)) * (chartWidth - chartPadding * 2);
              const y = chartPadding + (1 - (d.spending || 0) / maxValue) * chartHeight;
              return `${isNaN(x) || isNaN(y) ? '' : `${x},${y}`}`;
            })
            .filter(point => point !== '')
            .join(' ')}
          className="data-line"
          fill="none"
          strokeWidth="2"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const x = chartPadding + (i / Math.max(data.length - 1, 1)) * (chartWidth - chartPadding * 2);
          const y = chartPadding + (1 - (d.spending || 0) / maxValue) * chartHeight;
          if (isNaN(x) || isNaN(y)) return null;
          return (
            <circle key={`point-${i}`} cx={x} cy={y} r="4" className="data-point" />
          );
        })}

        {/* X-axis Labels */}
        {data.map((d, i) => {
          if (i % Math.max(Math.ceil(data.length / 6), 1) === 0) {
            const x = chartPadding + (i / Math.max(data.length - 1, 1)) * (chartWidth - chartPadding * 2);
            if (isNaN(x)) return null;
            return (
              <text key={`label-${i}`} x={x} y={chartHeight + chartPadding + 20} textAnchor="middle" className="axis-label">
                {d.month?.split(' ')[0]}
              </text>
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}

/**
 * Simple Bar Chart
 */
export function BarChart({ data }) {
  if (!data || data.length === 0) return <div className="chart">No data available</div>;

  const maxValue = Math.max(...data.map(d => d.total_spending || 0));
  const chartHeight = 300;
  const chartWidth = Math.max(data.length * 50, 400);
  const barWidth = Math.floor((chartWidth - 80) / (data.length || 1)) * 0.7;
  const barSpacing = Math.floor((chartWidth - 80) / (data.length || 1));

  return (
    <div className="chart bar-chart">
      <svg width={chartWidth} height={chartHeight + 80} viewBox={`0 0 ${chartWidth} ${chartHeight + 80}`}>
        {/* Axes */}
        <line x1="40" y1="10" x2="40" y2={chartHeight + 40} className="axis" />
        <line x1="40" y1={chartHeight + 40} x2={chartWidth - 40} y2={chartHeight + 40} className="axis" />

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = (d.total_spending || 0) / maxValue * chartHeight;
          const x = 40 + i * barSpacing + (barSpacing - barWidth) / 2;
          const y = chartHeight + 40 - barHeight;

          return (
            <g key={`bar-${i}`}>
              <rect x={x} y={y} width={barWidth} height={barHeight} className="bar" />
              <text x={x + barWidth / 2} y={chartHeight + 60} textAnchor="middle" className="axis-label">
                {d.vendor?.substring(0, 10) || 'N/A'}
              </text>
              <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" className="bar-label">
                ${(d.total_spending || 0).toFixed(0)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Simple Pie Chart
 */
export function PieChart({ data }) {
  if (!data || data.length === 0) return <div className="chart">No data available</div>;

  const total = data.reduce((sum, d) => sum + (d.total_spending || 0), 0);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  
  let currentAngle = -90;
  const slices = data.map((d, i) => {
    const percentage = (d.total_spending || 0) / total;
    const sliceAngle = percentage * 360;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;
    
    const x1 = 100 + 80 * Math.cos(startAngle);
    const y1 = 100 + 80 * Math.sin(startAngle);
    const x2 = 100 + 80 * Math.cos(endAngle);
    const y2 = 100 + 80 * Math.sin(endAngle);
    
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const path = `M 100,100 L ${x1},${y1} A 80,80 0 ${largeArc},1 ${x2},${y2} Z`;
    
    currentAngle += sliceAngle;
    return { path, color: colors[i % colors.length], percentage, label: d.category };
  });

  return (
    <div className="chart pie-chart">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {slices.map((slice, i) => (
          <g key={`slice-${i}`}>
            <path d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />
            {slice.percentage > 0.08 && (
              <text
                x={100 + 50 * Math.cos(((slices.slice(0, i).reduce((a, s) => a + s.percentage, 0) + slice.percentage / 2) * 360 - 90) * Math.PI / 180)}
                y={100 + 50 * Math.sin(((slices.slice(0, i).reduce((a, s) => a + s.percentage, 0) + slice.percentage / 2) * 360 - 90) * Math.PI / 180)}
                textAnchor="middle"
                className="pie-label"
              >
                {(slice.percentage * 100).toFixed(0)}%
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="pie-legend">
        {data.map((d, i) => (
          <div key={`legend-${i}`} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: colors[i % colors.length] }}></span>
            <span className="legend-label">{d.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
