/**
 * ExpenseList Component
 * Display and manage expenses with filtering and editing capabilities
 */

import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSync, FaFileDownload, FaFileCsv, FaFileAlt, FaPrint } from 'react-icons/fa';
import { expenseAPI } from '../services/api';
import { exportToCSV, exportToJSON, exportSummaryReport, printExpenses } from '../utils/exportUtils';
import '../styles/ExpenseList.css';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  
  // Edit/View states
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const categories = [
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Other'
  ];

  useEffect(() => {
    fetchExpenses();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchExpenses, 30000);
    
    // Listen for upload events
    const handleUpload = () => {
      console.log('📋 ExpenseList: Expense uploaded, refreshing...');
      fetchExpenses();
    };
    window.addEventListener('expenseUploaded', handleUpload);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('expenseUploaded', handleUpload);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, searchTerm, categoryFilter, dateFilter, sortBy]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getAll();
      console.log('📥 API Response:', response.data);
      
      // Backend returns { status, data, pagination } format
      const expensesData = response.data.data || response.data || [];
      console.log('📊 Extracted expenses:', expensesData);
      setExpenses(expensesData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load expenses');
      console.error('Error fetching expenses:', err);
      setExpenses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchExpenses();
  };

  const applyFilters = () => {
    // Ensure expenses is an array
    if (!Array.isArray(expenses)) {
      console.warn('applyFilters: expenses is not an array', expenses);
      setFilteredExpenses([]);
      return;
    }

    let filtered = [...expenses];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(exp => 
        exp.vendor?.toLowerCase().includes(term) ||
        exp.description?.toLowerCase().includes(term) ||
        exp.category?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(exp => exp.category === categoryFilter);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      filtered = filtered.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === now.toDateString();
      });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(exp => new Date(exp.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(exp => new Date(exp.date) >= monthAgo);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        case 'vendor':
          return (a.vendor || '').localeCompare(b.vendor || '');
        default:
          return 0;
      }
    });

    setFilteredExpenses(filtered);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditData({
      vendor: expense.vendor || '',
      amount: expense.amount || 0,
      category: expense.category || 'Other',
      date: expense.date ? expense.date.split('T')[0] : '',
      description: expense.description || ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      await expenseAPI.update(selectedExpense._id, editData);
      await fetchExpenses();
      setIsEditing(false);
      setSelectedExpense(null);
    } catch (err) {
      alert('Failed to update expense: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    try {
      await expenseAPI.delete(expenseId);
      await fetchExpenses();
      if (selectedExpense?._id === expenseId) {
        setSelectedExpense(null);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to delete expense: ' + (err.response?.data?.error || err.message));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatAmount = (amount) => {
    return `Rs ${amount.toFixed(2)}`;
  };

  if (loading) {
    return <div className="expense-list loading">Loading expenses...</div>;
  }

  return (
    <div className="expense-list">
      <div className="expense-header">
        <div>
          <h1><FaEdit style={{verticalAlign: 'middle'}} /> Expense Management</h1>
          <p>View, edit, and manage your expenses</p>
        </div>
        <button className="refresh-btn" onClick={handleRefresh} title="Refresh list">
          <FaSync style={{verticalAlign: 'middle'}} /> Refresh
        </button>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by vendor, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date Range:</label>
            <select 
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High-Low)</option>
              <option value="amount-asc">Amount (Low-High)</option>
              <option value="vendor">Vendor (A-Z)</option>
            </select>
          </div>
        </div>

        <div className="results-summary">
          Showing {filteredExpenses.length} of {expenses.length} expenses
          {filteredExpenses.length > 0 && (
            <span className="total-amount">
              {' • '}Total: {formatAmount(filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </span>
          )}
        </div>

        {/* Export Buttons */}
        {filteredExpenses.length > 0 && (
          <div className="export-actions">
            <button className="export-btn" onClick={() => exportToCSV(filteredExpenses)}>
              <FaFileCsv style={{verticalAlign: 'middle'}} /> Export CSV
            </button>
            <button className="export-btn" onClick={() => exportToJSON(filteredExpenses)}>
              <FaFileDownload style={{verticalAlign: 'middle'}} /> Export JSON
            </button>
            <button className="export-btn" onClick={() => exportSummaryReport(filteredExpenses)}>
              <FaFileAlt style={{verticalAlign: 'middle'}} /> Summary Report
            </button>
            <button className="export-btn" onClick={() => printExpenses(filteredExpenses)}>
              Print
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Expenses Grid */}
      <div className="expenses-container">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found matching your filters.</p>
            <button onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setDateFilter('all');
            }}>Clear Filters</button>
          </div>
        ) : (
          <div className="expenses-grid">
            {filteredExpenses.map(expense => (
              <div 
                key={expense._id} 
                className={`expense-card ${selectedExpense?._id === expense._id ? 'selected' : ''}`}
                onClick={() => !isEditing && setSelectedExpense(expense)}
              >
                <div className="card-header">
                  <div className="vendor-info">
                    <h3>{expense.vendor || 'Unknown Vendor'}</h3>
                    <span className="category-badge">{expense.category || 'Other'}</span>
                  </div>
                  <div className="amount">{formatAmount(expense.amount)}</div>
                </div>

                <div className="card-body">
                  {expense.description && (
                    <p className="description">{expense.description}</p>
                  )}
                  <div className="meta-info">
                    <span className="date">📅 {formatDate(expense.date)}</span>
                    {expense.ocrConfidence && (
                      <span className="confidence">
                        OCR: {(expense.ocrConfidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(expense);
                    }}
                  >
                    <FaEdit style={{verticalAlign: 'middle'}} /> Edit
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(expense._id);
                    }}
                  >
                    <FaTrash style={{verticalAlign: 'middle'}} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && selectedExpense && (
        <div className="modal-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Expense</h2>
              <button className="close-btn" onClick={() => setIsEditing(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Vendor *</label>
                <input
                  type="text"
                  value={editData.vendor}
                  onChange={(e) => setEditData({ ...editData, vendor: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="form-group">
                <label>Amount (Rs ) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editData.amount}
                  onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={editData.date}
                  onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows="3"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
