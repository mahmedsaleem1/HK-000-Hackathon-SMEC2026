import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, Calendar, User, LogOut, LayoutDashboard, Menu, X, BookOpen } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout, isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/facilities', label: 'Facilities', icon: Building2 },
        { path: '/my-bookings', label: 'My Bookings', icon: Calendar, auth: true },
    ];

    if (isAdmin()) {
        navLinks.push({ path: '/admin', label: 'Dashboard', icon: LayoutDashboard, auth: true });
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <div className="logo-icon">
                        <BookOpen size={24} strokeWidth={2} />
                    </div>
                    <span className="logo-text">Campus Hub</span>
                    <span className="logo-tag">beta</span>
                </Link>

                <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className={`nav-links ${mobileOpen ? 'active' : ''}`}>
                    {navLinks.map((link) => {
                        if (link.auth && !isAuthenticated) return null;
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <Icon size={18} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}

                    {isAuthenticated ? (
                        <div className="nav-user">
                            <span className="user-name">
                                <User size={16} />
                                Hey, {user?.fullName?.split(' ')[0]}
                            </span>
                            <button onClick={handleLogout} className="btn-logout">
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="nav-auth">
                            <Link to="/login" className="btn-nav" onClick={() => setMobileOpen(false)}>
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-nav primary" onClick={() => setMobileOpen(false)}>
                                Join Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
