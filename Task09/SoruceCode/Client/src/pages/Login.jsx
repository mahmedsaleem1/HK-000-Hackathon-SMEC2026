import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, LogIn, UserCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/facilities');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const quickLogin = (demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
        setTimeout(() => {
            document.querySelector('form').requestSubmit();
        }, 100);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <UserCircle size={48} strokeWidth={1.5} />
                    </div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to manage your bookings</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@campus.edu"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Your password"
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Signing in...' : (
                            <>
                                <LogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register">Sign up here</Link>
                    </p>
                </div>

                <div className="demo-credentials">
                    <strong>Quick test accounts:</strong>
                    <div className="demo-btns">
                        <button 
                            onClick={() => quickLogin('admin@campushub.edu', 'admin123')}
                            className="demo-btn"
                        >
                            Admin Account
                        </button>
                        <button 
                            onClick={() => quickLogin('rahul@student.edu', 'password123')}
                            className="demo-btn"
                        >
                            Student Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
