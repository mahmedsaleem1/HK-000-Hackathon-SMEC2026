/**
 * Analytics Component
 * Charts and visualizations for spending trends and analysis
 */

import { useState, useEffect } from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown, FaTags, FaStore, FaSync } from 'react-icons/fa';
import { MdShowChart } from 'react-icons/md';
import { analyticsAPI } from '../services/api';
import { LineChart, BarChart, PieChart } from './Charts';
import '../styles/Analytics.css';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('trends');
  const [trendsData, setTrendsData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [vendorData, setVendorData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
    
    // Listen for upload events
    const handleUpload = () => {
      console.log('📊 Analytics: Expense uploaded, refreshing...');
      fetchAnalyticsData();
    };
    window.addEventListener('expenseUploaded', handleUpload);
    
    return () => {
      window.removeEventListener('expenseUploaded', handleUpload);
    };
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [trends, category, vendors, forecast] = await Promise.all([
        analyticsAPI.getTrends(),
        analyticsAPI.getByCategory(),
        analyticsAPI.getTopVendors(10),
        analyticsAPI.getForecast(),
      ]);

      // Ensure data is properly formatted with defaults
      const trendsResult = trends.data.data || trends.data || {};
      setTrendsData({
        monthly_data: trendsResult.monthly_data || [],
        average_3_months: trendsResult.average_3_months || 0,
        average_6_months: trendsResult.average_6_months || 0,
        trend_direction: trendsResult.trend_direction || 'stable'
      });
      setCategoryData(category.data.data || category.data || []);
      setVendorData(vendors.data.data || vendors.data || []);
      setForecastData(forecast.data.data || forecast.data || {});
      setError(null);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
      // Set default values on error
      setTrendsData({
        monthly_data: [],
        average_3_months: 0,
        average_6_months: 0,
        trend_direction: 'stable'
      });
      setCategoryData([]);
      setVendorData([]);
      setForecastData({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics error">{error}</div>;
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1><FaChartLine style={{verticalAlign: 'middle'}} /> Spending Analytics</h1>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <FaArrowUp style={{verticalAlign: 'middle'}} /> Trends
          </button>
          <button 
            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FaTags style={{verticalAlign: 'middle'}} /> Categories
          </button>
          <button 
            className={`tab ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <FaStore style={{verticalAlign: 'middle'}} /> Vendors
          </button>
          <button 
            className={`tab ${activeTab === 'forecast' ? 'active' : ''}`}
            onClick={() => setActiveTab('forecast')}
          >
            <MdShowChart style={{verticalAlign: 'middle'}} /> Forecast
          </button>
        </div>
      </div>

      {/* Trends Tab */}
      {activeTab === 'trends' && trendsData && (
        <div className="tab-content trends-tab">
          <div className="chart-container">
            <h3>💹 12-Month Spending Trends</h3>
            <LineChart data={trendsData.monthly_data} />
            <div className="trend-stats">
              <div className="stat">
                <span className="label">3-Month Average:</span>
                <span className="value">${trendsData.average_3_month?.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="label">6-Month Average:</span>
                <span className="value">${trendsData.average_6_month?.toFixed(2)}</span>
              </div>
              <div className="stat">
                <span className="label">Trend Direction:</span>
                <span className={`value trend-${trendsData.trend_direction}`}>
                  {trendsData.trend_direction === 'increasing' ? <FaArrowUp style={{verticalAlign: 'middle'}} /> : <FaArrowDown style={{verticalAlign: 'middle'}} />} {trendsData.trend_direction}
                </span>
              </div>
              <div className="stat">
                <span className="label">Change:</span>
                <span className="value">{trendsData.trend_percentage?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && categoryData && (
        <div className="tab-content categories-tab">
          <div className="chart-container">
            <h3><FaTags style={{verticalAlign: 'middle'}} /> Spending by Category</h3>
            <PieChart data={categoryData.categories} />
            <div className="categories-list">
              {categoryData.categories?.map((cat) => (
                <div key={cat.category} className={`category-item ${cat.is_over_budget ? 'over-budget' : ''}`}>
                  <div className="category-header">
                    <span className="name">{cat.category}</span>
                    <span className="amount">${cat.total_spending?.toFixed(2)}</span>
                  </div>
                  {cat.budget_limit && (
                    <div className="budget-bar">
                      <div 
                        className={`progress ${cat.is_over_budget ? 'over' : 'under'}`}
                        style={{ width: `${Math.min((cat.total_spending / cat.budget_limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="category-footer">
                    <span>{cat.transaction_count} transactions</span>
                    {cat.budget_limit && (
                      <span>{cat.percentage_of_budget}% of ${cat.budget_limit?.toFixed(2)} budget</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && vendorData && (
        <div className="tab-content vendors-tab">
          <div className="chart-container">
            <h3><FaStore style={{verticalAlign: 'middle'}} /> Top Vendors</h3>
            <BarChart data={vendorData.top_vendors} />
            <div className="vendors-list">
              {vendorData.top_vendors?.map((vendor, idx) => (
                <div key={vendor.vendor} className="vendor-item">
                  <div className="vendor-rank">#{idx + 1}</div>
                  <div className="vendor-info">
                    <span className="vendor-name">{vendor.vendor}</span>
                    <span className="vendor-detail">
                      {vendor.transaction_count} transactions @ ${vendor.average_transaction?.toFixed(2)} avg
                    </span>
                  </div>
                  <div className="vendor-amount">${vendor.total_spending?.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && forecastData && (
        <div className="tab-content forecast-tab">
          <div className="forecast-container">
            <h3><MdShowChart style={{verticalAlign: 'middle'}} /> Spending Forecast</h3>
            <div className="forecast-cards">
              <div className="forecast-card">
                <h4>Current Month Progress</h4>
                <div className="progress-stats">
                  <div className="stat-row">
                    <span>Days Elapsed:</span>
                    <strong>{forecastData.current_month_progress?.days_elapsed}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Days Remaining:</span>
                    <strong>{forecastData.current_month_progress?.days_remaining}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Current Spending:</span>
                    <strong>${forecastData.current_month_progress?.current_spending?.toFixed(2)}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Estimated Total:</span>
                    <strong>${forecastData.current_month_progress?.estimated_total?.toFixed(2)}</strong>
                  </div>
                </div>
              </div>

              <div className="forecast-card">
                <h4>Next Month Prediction</h4>
                <div className="forecast-prediction">
                  <div className="predicted-amount">
                    ${forecastData.predicted_next_month?.toFixed(2)}
                  </div>
                  <div className="forecast-basis">
                    Based on 3-month average of ${forecastData.average_monthly?.toFixed(2)}
                  </div>
                  <div className="forecast-trend">
                    {forecastData.trend_direction === 'increasing' ? <FaArrowUp style={{verticalAlign: 'middle'}} /> : <FaArrowDown style={{verticalAlign: 'middle'}} />}
                    {' '}Trend: {forecastData.trend_direction}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button className="refresh-btn" onClick={fetchAnalyticsData}>🔄 Refresh</button>
    </div>
  );
}
