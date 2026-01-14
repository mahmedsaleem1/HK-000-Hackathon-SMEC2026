import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🎓 StudentGig</Link>
      </div>

      <div className="navbar-menu">
        <Link to="/" className="nav-link">Browse Tasks</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/create-task" className="nav-link">Post Task</Link>
            <Link to="/my-tasks" className="nav-link">My Tasks</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
