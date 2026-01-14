import { useState } from 'react';
import './App.css';
import PostRide from './components/PostRide';
import SearchRides from './components/SearchRides';
import RideHistory from './components/RideHistory';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="site-title">UniRide</h1>
          <p className="tagline">Campus carpooling for students</p>
        </div>
      </header>

      <nav className="main-nav">
        <button 
          className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Find Rides
        </button>
        <button 
          className={`nav-btn ${activeTab === 'post' ? 'active' : ''}`}
          onClick={() => setActiveTab('post')}
        >
          Offer a Ride
        </button>
        <button 
          className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          My Rides
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'search' && <SearchRides />}
        {activeTab === 'post' && <PostRide onRidePosted={() => setActiveTab('search')} />}
        {activeTab === 'history' && <RideHistory />}
      </main>

      <footer className="app-footer">
        <p>FAST-NUCES Carpooling Platform</p>
        <p className="copyright">© 2026 UniRide</p>
      </footer>
    </div>
  );
}

export default App;
