import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUser, FaSignOutAlt, FaSearch, FaComments } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/profile/${searchQuery.trim()}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
        
        <img className='coverpic' src="/temp/coverpic.jpg" alt="" />
          <span>
            
            Meemify</span>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-links">
          <Link to="/" className="nav-link">
            <FaHome />
            <span>Home</span>
          </Link>
          
          {user && (
            <Link to={`/profile/${user.username}`} className="nav-link">
              <FaUser />
              <span>Profile</span>
            </Link>
          )}
          
          <button onClick={handleLogout} className="nav-link logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
