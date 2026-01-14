import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone, Building, Eye, EyeOff, GraduationCap } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        department: '',
        role: 'student'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords don\'t match!');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password needs at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                department: formData.department,
                role: formData.role
            });
            toast.success('Account created! Welcome aboard.');
            navigate('/facilities');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card register-card">
                <div className="auth-header">
                    <div className="auth-logo">
                        <GraduationCap size={48} strokeWidth={1.5} />
                    </div>
                    <h1>Join Campus Hub</h1>
                    <p>Takes less than a minute, we promise</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <div className="input-wrapper">
                                <User size={18} />
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="What should we call you?"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <div className="input-wrapper">
                                <Mail size={18} />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@campus.edu"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone</label>
                            <div className="input-wrapper">
                                <Phone size={18} />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="9876543210"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="department">Department</label>
                            <div className="input-wrapper">
                                <Building size={18} />
                                <input
                                    id="department"
                                    name="department"
                                    type="text"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g., Computer Science"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="At least 6 characters"
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

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-wrapper">
                                <Lock size={18} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Same as above"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">You are a</label>
                        <div className="input-wrapper">
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                style={{ border: 'none', background: 'transparent', flex: 1, outline: 'none', fontSize: '0.95rem' }}
                            >
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="staff">Staff</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login">Sign in instead</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
