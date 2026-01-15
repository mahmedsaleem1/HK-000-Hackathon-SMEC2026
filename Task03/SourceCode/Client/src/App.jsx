
import { useState } from 'react';
import { MdDashboard, MdTrendingUp, MdReceipt, MdCameraAlt, MdBarChart, MdNotifications, MdSettings, MdEdit } from 'react-icons/md';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import ExpenseList from './components/ExpenseList';
import ReceiptUpload from './components/ReceiptUpload';
import Statistics from './components/Statistics';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleUploadSuccess = () => {
    setCurrentPage('expenses');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analytics':
        return <Analytics />;
      case 'expenses':
        return <ExpenseList />;
      case 'upload':
        return <ReceiptUpload onUploadSuccess={handleUploadSuccess} />;
      case 'statistics':
        return <Statistics />;
      case 'alerts':
        return <Alerts />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1><MdReceipt style={{verticalAlign: 'middle'}} /> Receipt Scanner</h1>
          <p>AI-Powered Expense Analytics System</p>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-content">
          <button 
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <MdDashboard style={{verticalAlign: 'middle'}} /> Dashboard
          </button>
          <button 
            className={`nav-btn ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <MdTrendingUp style={{verticalAlign: 'middle'}} /> Analytics
          </button>
          <button 
            className={`nav-btn ${currentPage === 'expenses' ? 'active' : ''}`}
            onClick={() => setCurrentPage('expenses')}
          >
            <MdEdit style={{verticalAlign: 'middle'}} /> Expenses
          </button>
          <button 
            className={`nav-btn ${currentPage === 'upload' ? 'active' : ''}`}
            onClick={() => setCurrentPage('upload')}
          >
            <MdCameraAlt style={{verticalAlign: 'middle'}} /> Upload
          </button>
          <button 
            className={`nav-btn ${currentPage === 'statistics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('statistics')}
          >
            <MdBarChart style={{verticalAlign: 'middle'}} /> Statistics
          </button>
          <button 
            className={`nav-btn ${currentPage === 'alerts' ? 'active' : ''}`}
            onClick={() => setCurrentPage('alerts')}
          >
            <MdNotifications style={{verticalAlign: 'middle'}} /> Alerts
          </button>
          <button 
            className={`nav-btn ${currentPage === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentPage('settings')}
          >
            <MdSettings style={{verticalAlign: 'middle'}} /> Settings
          </button>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>© 2026 Receipt Scanner - AI-Powered Expense Analytics | HK-036 Hackathon SMEC 2026</p>
          
        </div>
      </footer>
    </div>
  );
}

export default App;
