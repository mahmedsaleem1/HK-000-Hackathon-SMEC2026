/**
 * Statistics Component
 * Display comprehensive expense statistics and insights
 */

import { useState, useEffect } from 'react';
import { FaChartBar, FaMoneyBillWave, FaChartLine, FaArrowUp } from 'react-icons/fa';
import { expenseAPI, analyticsAPI } from '../services/api';
import { LineChart, BarChart, PieChart } from './Charts';
import '../styles/Statistics.css';

export default function Statistics() {
  const [stats, setStats] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, summaryRes, categoryRes, dailyRes] = await Promise.all([
        expenseAPI.getAll(),
        analyticsAPI.getSummary(),
        analyticsAPI.getByCategory(),
        analyticsAPI.getDaily()
      ]);

      // Backend returns { status, data, pagination } format
      const expensesData = expensesRes.data.data || expensesRes.data || [];
      console.log('📊 Statistics - Extracted expenses:', expensesData);
      setExpenses(expensesData);
      
      // Calculate comprehensive statistics
      const filteredExpenses = filterByTimeRange(expensesData);
      const statistics = calculateStatistics(
        filteredExpenses, 
        summaryRes.data.data || summaryRes.data || {}, 
        categoryRes.data.data || categoryRes.data || [], 
        dailyRes.data.data || dailyRes.data || []
      );
      setStats(statistics);
      setError(null);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (expenses) => {
    // Ensure expenses is an array
    if (!Array.isArray(expenses)) {
      console.warn('filterByTimeRange: expenses is not an array', expenses);
      return [];
    }

    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return expenses;
    }

    return expenses.filter(exp => new Date(exp.date) >= startDate);
  };

  const calculateStatistics = (expenses, summary, categories, daily) => {
    if (expenses.length === 0) {
      return {
        total: 0,
        count: 0,
        average: 0,
        median: 0,
        highest: 0,
        lowest: 0,
        categories: [],
        vendors: [],
        dailyAverage: 0,
        weekdayDistribution: [],
        monthlyTrend: [],
        frequentCategories: [],
        expensiveCategories: []
      };
    }

    const amounts = expenses.map(e => e.amount).sort((a, b) => a - b);
    const total = amounts.reduce((sum, amt) => sum + amt, 0);

    // Calculate median
    const mid = Math.floor(amounts.length / 2);
    const median = amounts.length % 2 === 0
      ? (amounts[mid - 1] + amounts[mid]) / 2
      : amounts[mid];

    // Group by vendor
    const vendorMap = expenses.reduce((acc, exp) => {
      const vendor = exp.vendor || 'Unknown';
      if (!acc[vendor]) {
        acc[vendor] = { count: 0, total: 0 };
      }
      acc[vendor].count++;
      acc[vendor].total += exp.amount;
      return acc;
    }, {});

    const topVendors = Object.entries(vendorMap)
      .map(([vendor, data]) => ({ vendor, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Weekday distribution
    const weekdayMap = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    expenses.forEach(exp => {
      const day = weekdays[new Date(exp.date).getDay()];
      weekdayMap[day] += exp.amount;
    });

    const weekdayDistribution = Object.entries(weekdayMap).map(([day, amount]) => ({
      day,
      amount
    }));

    // Category analysis
    const categoryMap = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Other';
      if (!acc[cat]) {
        acc[cat] = { count: 0, total: 0 };
      }
      acc[cat].count++;
      acc[cat].total += exp.amount;
      return acc;
    }, {});

    const frequentCategories = Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.count - a.count);

    const expensiveCategories = Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data, average: data.total / data.count }))
      .sort((a, b) => b.average - a.average);

    // Daily average
    const dateRange = expenses.reduce((acc, exp) => {
      const date = new Date(exp.date);
      if (!acc.min || date < acc.min) acc.min = date;
      if (!acc.max || date > acc.max) acc.max = date;
      return acc;
    }, { min: null, max: null });

    const daysDiff = dateRange.min && dateRange.max
      ? Math.ceil((dateRange.max - dateRange.min) / (1000 * 60 * 60 * 24)) + 1
      : 1;

    return {
      total,
      count: expenses.length,
      average: total / expenses.length,
      median,
      highest: Math.max(...amounts),
      lowest: Math.min(...amounts),
      categories: categories || [],
      vendors: topVendors,
      dailyAverage: total / daysDiff,
      weekdayDistribution,
      frequentCategories,
      expensiveCategories,
      dateRange: {
        start: dateRange.min?.toLocaleDateString(),
        end: dateRange.max?.toLocaleDateString(),
        days: daysDiff
      }
    };
  };

  const formatAmount = (amount) => `Rs ${amount.toFixed(2)}`;

  if (loading) {
    return <div className="statistics loading">Loading statistics...</div>;
  }

  if (error) {
    return <div className="statistics error">{error}</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="statistics">
      <div className="stats-header">
        <div>
          <h1>📊 Expense Statistics</h1>
          <p>Comprehensive insights and analysis</p>
        </div>
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            Last Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            Last Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            Last Year
          </button>
          <button
            className={timeRange === 'all' ? 'active' : ''}
            onClick={() => setTimeRange('all')}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="key-metrics">
        <div className="metric-card">
          <div className="metric-icon"><FaMoneyBillWave size={32} /></div>
          <div className="metric-content">
            <h3>Total Spending</h3>
            <p className="metric-value">{formatAmount(stats.total)}</p>
            <span className="metric-label">{stats.count} transactions</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><FaChartBar size={32} /></div>
          <div className="metric-content">
            <h3>Average Transaction</h3>
            <p className="metric-value">{formatAmount(stats.average)}</p>
            <span className="metric-label">Mean value</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon"><FaArrowUp size={32} /></div>
          <div className="metric-content">
            <h3>Median Transaction</h3>
            <p className="metric-value">{formatAmount(stats.median)}</p>
            <span className="metric-label">Middle value</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Daily Average</h3>
            <p className="metric-value">{formatAmount(stats.dailyAverage)}</p>
            <span className="metric-label">Per day</span>
          </div>
        </div>
      </div>

      {/* Range and Extremes */}
      <div className="stats-row">
        <div className="stats-card">
          <h3>Transaction Range</h3>
          <div className="range-display">
            <div className="range-item">
              <span className="range-label">Highest</span>
              <span className="range-value high">{formatAmount(stats.highest)}</span>
            </div>
            <div className="range-divider">→</div>
            <div className="range-item">
              <span className="range-label">Lowest</span>
              <span className="range-value low">{formatAmount(stats.lowest)}</span>
            </div>
          </div>
          {stats.dateRange && (
            <p className="date-range">
              Period: {stats.dateRange.start} to {stats.dateRange.end} ({stats.dateRange.days} days)
            </p>
          )}
        </div>
      </div>

      {/* Weekday Distribution */}
      <div className="stats-row">
        <div className="stats-card full-width">
          <h3>Spending by Day of Week</h3>
          {stats.weekdayDistribution.length > 0 && (
            <BarChart 
              data={stats.weekdayDistribution.map(d => ({
                label: d.day,
                value: d.amount
              }))}
            />
          )}
        </div>
      </div>

      {/* Category Analysis */}
      <div className="stats-row">
        <div className="stats-card">
          <h3>Most Frequent Categories</h3>
          <div className="category-list">
            {stats.frequentCategories.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-count">{cat.count} transactions</span>
                </div>
                <span className="category-total">{formatAmount(cat.total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-card">
          <h3>Most Expensive Categories (Avg)</h3>
          <div className="category-list">
            {stats.expensiveCategories.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="category-item">
                <div className="category-info">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-count">{cat.count} transactions</span>
                </div>
                <span className="category-total">{formatAmount(cat.average)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="stats-row">
        <div className="stats-card full-width">
          <h3>Top 10 Vendors by Spending</h3>
          <div className="vendor-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Vendor</th>
                  <th>Transactions</th>
                  <th>Total Spent</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {stats.vendors.map((vendor, idx) => (
                  <tr key={idx}>
                    <td className="rank">#{idx + 1}</td>
                    <td className="vendor-name">{vendor.vendor}</td>
                    <td>{vendor.count}</td>
                    <td className="amount">{formatAmount(vendor.total)}</td>
                    <td className="amount">{formatAmount(vendor.total / vendor.count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
