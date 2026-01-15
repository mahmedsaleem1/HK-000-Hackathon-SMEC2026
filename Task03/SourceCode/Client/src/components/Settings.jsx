import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaChartBar, FaBullseye, FaCheck, FaLightbulb, FaTags, FaBell } from 'react-icons/fa';
import { alertsAPI } from '../services/api';
import '../styles/Settings.css';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    monthly_budget: 2000,
    category_budgets: {},
    alert_thresholds: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const defaultCategories = [
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Other',
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getSettings();
      const data = response.data.data;
      setSettings(data);
      setFormData({
        monthly_budget: data.monthly_budget || 2000,
        category_budgets: data.category_budgets || {},
        alert_thresholds: data.alert_thresholds || {
          high_transaction_percentage: 30,
          budget_alert_percentages: [50, 75, 90],
        },
      });
      setError(null);
    } catch (err) {
      setError('Failed to load settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyBudgetChange = (e) => {
    setFormData({
      ...formData,
      monthly_budget: parseFloat(e.target.value) || 0,
    });
  };

  const handleCategoryBudgetChange = (category, value) => {
    setFormData({
      ...formData,
      category_budgets: {
        ...formData.category_budgets,
        [category]: parseFloat(value) || 0,
      },
    });
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await alertsAPI.updateSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchSettings();
    } catch (err) {
      setError('Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        monthly_budget: settings.monthly_budget || 2000,
        category_budgets: settings.category_budgets || {},
        alert_thresholds: settings.alert_thresholds || {},
      });
    }
  };

  if (loading) {
    return <div className="settings loading">Loading settings...</div>;
  }

  const monthlyBudgetAmount = formData.monthly_budget;
  const categoryBudgetTotal = Object.values(formData.category_budgets || {})
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const remaining = monthlyBudgetAmount - categoryBudgetTotal;

  return (
    <div className="settings">
      <div className="settings-header">
        <h1> Settings & Configuration</h1>
        <p>Manage your budget and alert preferences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message"><FaCheck style={{verticalAlign: 'middle'}} /> Settings saved successfully!</div>}

      <div className="settings-content">
        {/* Monthly Budget Section */}
        <section className="settings-section">
          <div className="section-header">
            <h2><FaMoneyBillWave style={{verticalAlign: 'middle'}} /> Monthly Budget</h2>
            <p>Set your overall monthly spending limit</p>
          </div>

          <div className="form-group">
            <label htmlFor="monthly_budget">Monthly Budget Amount</label>
            <div className="input-wrapper">
              <span className="currency">Rs</span>
              <input
                id="monthly_budget"
                type="number"
                min="0"
                step="50"
                value={formData.monthly_budget}
                onChange={handleMonthlyBudgetChange}
                className="amount-input"
              />
            </div>
            <div className="help-text">
              Set the maximum amount you want to spend this month
            </div>
          </div>
        </section>

        {/* Category Budgets Section */}
        <section className="settings-section">
          <div className="section-header">
            <h2>🏷️ Category Budgets</h2>
            <p>Set spending limits for each category</p>
          </div>

          <div className="categories-grid">
            {defaultCategories.map((category) => (
              <div key={category} className="form-group category-budget">
                <label htmlFor={`budget_${category}`}>{category}</label>
                <div className="input-wrapper">
                  <span className="currency">Rs</span>
                  <input
                    id={`budget_${category}`}
                    type="number"
                    min="0"
                    step="25"
                    value={formData.category_budgets?.[category] || 0}
                    onChange={(e) => handleCategoryBudgetChange(category, e.target.value)}
                    className="amount-input"
                    placeholder="0"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="budget-summary">
            <div className="summary-row">
              <span className="label">Monthly Budget:</span>
              <span className="amount">Rs  {monthlyBudgetAmount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Category Budgets Total:</span>
              <span className="amount">Rs  {categoryBudgetTotal.toFixed(2)}</span>
            </div>
            <div className={`summary-row ${remaining < 0 ? 'negative' : 'positive'}`}>
              <span className="label">Remaining for Other:</span>
              <span className="amount">Rs  {remaining.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Alert Thresholds Section */}
        <section className="settings-section">
          <div className="section-header">
            <h2><FaBell style={{verticalAlign: 'middle'}} /> Alert Thresholds</h2>
            <p>Configure when you receive notifications</p>
          </div>

          <div className="threshold-info">
            <div className="info-card">
              <h4>High Transaction Alert</h4>
              <p>Get alerted when a single transaction exceeds a percentage of your monthly budget</p>
              <div className="threshold-value">
                <span>Threshold: {formData.alert_thresholds?.high_transaction_percentage || 30}% of budget</span>
                <span className="example">
                  (e.g., Rs  {(monthlyBudgetAmount * 0.3).toFixed(2)} with your current budget)
                </span>
              </div>
            </div>

            <div className="info-card">
              <h4>Budget Percentage Alerts</h4>
              <p>Get alerted when you reach certain milestones in your monthly spending</p>
              <div className="threshold-list">
                {formData.alert_thresholds?.budget_alert_percentages?.map((pct) => (
                  <div key={pct} className="threshold-item">
                    <span>{pct}% of budget</span>
                    <span className="example">
                      Rs  {(monthlyBudgetAmount * (pct / 100)).toFixed(2)}
                    </span>
                  </div>
                )) || <div>No thresholds configured</div>}
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="settings-actions">
          <button
            className="btn btn-primary"
            onClick={handleSaveSettings}
            disabled={saving}
          >
            {saving ? '💾 Saving...' : '💾 Save Settings'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={saving}
          >
            ↶ Reset to Saved
          </button>
        </div>
      </div>

      {/* Configuration Tips */}
      <section className="settings-section tips-section">
        <h3><FaLightbulb style={{verticalAlign: 'middle'}} /> Configuration Tips</h3>
        <div className="tips-grid">
          <div className="tip">
            <h4><FaChartBar style={{verticalAlign: 'middle'}} /> Budget Planning</h4>
            <p>Set a realistic monthly budget based on your spending patterns. Review trends to adjust as needed.</p>
          </div>
          <div className="tip">
            <h4><FaTags style={{verticalAlign: 'middle'}} /> Category Budgets</h4>
            <p>Allocate specific amounts to categories you overspend on. The total should not exceed your monthly budget.</p>
          </div>
          <div className="tip">
            <h4><FaBell style={{verticalAlign: 'middle'}} /> Alert Timing</h4>
            <p>Set alerts at 50%, 75%, and 90% to get early warnings before exceeding your budget.</p>
          </div>
          <div className="tip">
            <h4><FaBullseye style={{verticalAlign: 'middle'}} /> Regular Review</h4>
            <p>Check your analytics monthly to identify spending patterns and adjust budgets accordingly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
