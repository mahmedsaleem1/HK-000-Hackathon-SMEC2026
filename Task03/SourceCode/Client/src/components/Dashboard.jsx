/**
 * Dashboard Component
 * Main dashboard showing summary statistics and quick insights
 */

import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartBar, FaArrowUp, FaMapMarkerAlt, FaDotCircle, FaBolt, FaSync, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { MdAttachMoney } from 'react-icons/md';
import { analyticsAPI } from '../services/api';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSummary, 30000);
    
    // Listen for upload events
    const handleUpload = () => {
      console.log('📊 Dashboard: Expense uploaded, refreshing...');
      fetchSummary();
    };
    window.addEventListener('expenseUploaded', handleUpload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('expenseUploaded', handleUpload);
    };
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getSummary();
      setSummary(response.data.data || response.data || {});
      setError(null);
    } catch (err) {
      setError('Failed to load summary data');
      console.error(err);
      setSummary({}); // Set empty object on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSummary();
  };

  if (loading) {
    return <div className="dashboard loading">Loading summary...</div>;
  }

  if (error) {
    return <div className="dashboard error">{error}</div>;
  }

  if (!summary) {
    return <div className="dashboard">No data available</div>;
  }

  const budgetPercentage = summary.percentage_used || 0;
  const budgetStatus = budgetPercentage > 90 ? 'critical' : budgetPercentage > 75 ? 'warning' : 'good';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1><FaMoneyBillWave style={{verticalAlign: 'middle'}} /> Spending Dashboard</h1>
        <p className="period">{summary.period}</p>
        <button className="refresh-btn" onClick={handleRefresh} title="Refresh data">
          <FaSync style={{verticalAlign: 'middle'}} /> Refresh
        </button>
      </div>

      <div className="cards-grid">
        {/* Total Spending Card */}
        <div className="card summary-card">
          <div className="card-header">
            <h3><MdAttachMoney style={{verticalAlign: 'middle'}} /> Total Spending</h3>
          </div>
          <div className="card-content">
            <div className="amount">${summary.total_spending?.toFixed(2) || '0.00'}</div>
            <div className="count">{summary.transaction_count} transactions</div>
          </div>
        </div>

        {/* Budget Status Card */}
        <div className={`card budget-card status-${budgetStatus}`}>
          <div className="card-header">
            <h3><FaChartBar style={{verticalAlign: 'middle'}} /> Budget Status</h3>
          </div>
          <div className="card-content">
            <div className="budget-amount">
              ${summary.total_spending?.toFixed(2) || '0.00'} / ${summary.monthly_budget?.toFixed(2) || '0.00'}
            </div>
            <div className="budget-bar">
              <div 
                className={`progress status-${budgetStatus}`}
                style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
              ></div>
            </div>
            <div className="budget-info">
              <span className="percentage">{budgetPercentage.toFixed(0)}% used</span>
              <span className="remaining">
                ${Math.max(0, summary.remaining_budget || 0).toFixed(2)} remaining
              </span>
            </div>
          </div>
        </div>

        {/* Average Transaction Card */}
        <div className="card stat-card">
          <div className="card-header">
            <h3><FaArrowUp style={{verticalAlign: 'middle'}} /> Average</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">${summary.average_transaction?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">per transaction</div>
          </div>
        </div>

        {/* Highest Transaction Card */}
        <div className="card stat-card">
          <div className="card-header">
            <h3><FaMapMarkerAlt style={{verticalAlign: 'middle'}} /> Highest</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">${summary.highest_transaction?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">largest purchase</div>
          </div>
        </div>

        {/* Lowest Transaction Card */}
        <div className="card stat-card">
          <div className="card-header">
            <h3><FaDotCircle style={{verticalAlign: 'middle'}} /> Lowest</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">${summary.lowest_transaction?.toFixed(2) || '0.00'}</div>
            <div className="stat-label">smallest purchase</div>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="card action-card">
          <div className="card-header">
            <h3><FaBolt style={{verticalAlign: 'middle'}} /> Quick Actions</h3>
          </div>
          <div className="card-content">
            <button className="action-btn primary">Upload Receipt</button>
            <button className="action-btn secondary">View Reports</button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="status-footer">
        <div className="status-item">
          <span className="label">Status:</span>
          <span className={`badge status-${budgetStatus}`}>
            {budgetStatus === 'critical' ? <><FaExclamationTriangle style={{verticalAlign: 'middle'}} /> Critical</> : budgetStatus === 'warning' ? <><FaBolt style={{verticalAlign: 'middle'}} /> Warning</> : <><FaCheck style={{verticalAlign: 'middle'}} /> Good</>}
          </span>
        </div>
        <div className="status-item">
          <span className="label">Last Updated:</span>
          <span className="time">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
