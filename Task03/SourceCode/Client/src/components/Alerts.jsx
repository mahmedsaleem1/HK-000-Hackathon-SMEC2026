/**
 * Alerts Component
 * Display and manage expense alerts and notifications
 */

import { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaFolder, FaSync, FaStore, FaBell, FaBan, FaDollarSign, FaCheck } from 'react-icons/fa';
import { alertsAPI } from '../services/api';
import '../styles/Alerts.css';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const params = filter === 'all' ? {} : { isRead: filter === 'unread' ? 'false' : 'true' };
      const response = await alertsAPI.getAll(params);
      setAlerts(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await alertsAPI.markAsRead(alertId);
      setAlerts(alerts.map(a => a._id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Failed to mark alert as read:', err);
    }
  };

  const handleDismiss = (alertId) => {
    setAlerts(alerts.filter(a => a._id !== alertId));
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'HIGH_TRANSACTION':
        return <FaDollarSign color="#ff9800" />;
      case 'BUDGET_EXCEEDED':
        return <FaBan color="#f44336" />;
      case 'BUDGET_PERCENTAGE':
        return <FaExclamationTriangle color="#ff9800" />;
      default:
        return <FaBell />;
    }
  };

  const getSeverityClass = (severity) => {
    return severity?.toLowerCase() || 'info';
  };

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : filter === 'unread' 
    ? alerts.filter(a => !a.is_read)
    : alerts.filter(a => a.is_read);

  if (loading) {
    return <div className="alerts loading">Loading alerts...</div>;
  }

  return (
    <div className="alerts">
      <div className="alerts-header">
        <h1>🔔 Notifications</h1>
        <div className="alert-controls">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({alerts.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({alerts.filter(a => !a.is_read).length})
          </button>
          <button 
            className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read ({alerts.filter(a => a.is_read).length})
          </button>
        </div>
      </div>

      {error && <div className="alerts-error">{error}</div>}

      <div className="alerts-list">
        {filteredAlerts.length === 0 ? (
          <div className="empty-state">
            <p>✨ All caught up! No alerts to display.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert._id}
              className={`alert-item severity-${getSeverityClass(alert.severity)} ${alert.is_read ? 'read' : 'unread'}`}
            >
              <div className="alert-icon">
                {getAlertIcon(alert.alert_type)}
              </div>
              
              <div className="alert-content">
                <div className="alert-title">
                  {alert.title}
                  {!alert.is_read && <span className="unread-badge">New</span>}
                </div>
                <p className="alert-message">{alert.message}</p>
                
                {alert.related_expense_id && (
                  <div className="alert-expense">
                    <span className="expense-vendor">
                      <FaStore style={{verticalAlign: 'middle'}} /> {alert.related_expense_id.vendor}
                    </span>
                    <span className="expense-amount">
                      ${alert.related_expense_id.amount?.toFixed(2)}
                    </span>
                    <span className="expense-category">
                      <FaFolder style={{verticalAlign: 'middle'}} /> {alert.related_expense_id.category}
                    </span>
                  </div>
                )}
                
                <div className="alert-meta">
                  <span className="alert-type">{alert.alert_type?.replace(/_/g, ' ')}</span>
                  <span className="alert-time">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="alert-actions">
                {!alert.is_read && (
                  <button
                    className="action-btn mark-read"
                    onClick={() => handleMarkAsRead(alert._id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="action-btn dismiss"
                  onClick={() => handleDismiss(alert._id)}
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Alert Summary Stats */}
      {alerts.length > 0 && (
        <div className="alerts-summary">
          <div className="summary-item">
            <span className="label">Critical Alerts:</span>
            <span className="value">{alerts.filter(a => a.severity === 'CRITICAL').length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Warnings:</span>
            <span className="value">{alerts.filter(a => a.severity === 'WARNING').length}</span>
          </div>
          <div className="summary-item">
            <span className="label">Unread:</span>
            <span className="value">{alerts.filter(a => !a.is_read).length}</span>
          </div>
          <button className="refresh-btn" onClick={fetchAlerts}><FaSync style={{verticalAlign: 'middle'}} /> Refresh</button>
        </div>
      )}
    </div>
  );
}
