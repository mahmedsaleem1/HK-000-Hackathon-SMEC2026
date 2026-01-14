import { useState } from 'react';

const BidForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    deliveryValue: '',
    deliveryUnit: 'days',
    proposal: '',
    bidType: 'price'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await onSubmit({
      amount: Number(formData.amount),
      deliveryTime: {
        value: Number(formData.deliveryValue),
        unit: formData.deliveryUnit
      },
      proposal: formData.proposal,
      bidType: formData.bidType
    });

    setLoading(false);
  };

  return (
    <div className="bid-form-container">
      <h3>Place Your Bid</h3>
      <p className="budget-hint">
        Budget: ${task.budget.min} - ${task.budget.max}
      </p>

      <form onSubmit={handleSubmit} className="bid-form">
        <div className="form-group">
          <label>Bid Type</label>
          <div className="bid-type-toggle">
            <button
              type="button"
              className={formData.bidType === 'price' ? 'active' : ''}
              onClick={() => setFormData({ ...formData, bidType: 'price' })}
            >
              💰 Price
            </button>
            <button
              type="button"
              className={formData.bidType === 'time' ? 'active' : ''}
              onClick={() => setFormData({ ...formData, bidType: 'time' })}
            >
              ⏱️ Time
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Your Bid Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min={0}
            placeholder="Enter your price"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deliveryValue">Delivery Time</label>
            <input
              type="number"
              id="deliveryValue"
              name="deliveryValue"
              value={formData.deliveryValue}
              onChange={handleChange}
              required
              min={1}
              placeholder="e.g., 3"
            />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryUnit">Unit</label>
            <select
              id="deliveryUnit"
              name="deliveryUnit"
              value={formData.deliveryUnit}
              onChange={handleChange}
            >
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="proposal">Your Proposal</label>
          <textarea
            id="proposal"
            name="proposal"
            value={formData.proposal}
            onChange={handleChange}
            required
            minLength={50}
            rows={5}
            placeholder="Explain why you're the best fit for this task... (min 50 characters)"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Bid'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BidForm;
