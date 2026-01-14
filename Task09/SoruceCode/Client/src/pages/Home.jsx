import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Clock, CheckCircle, Calendar, Shield } from 'lucide-react';

const Home = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="home-page">
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">New for 2026 Semester</div>
                    <h1>Stop Fighting Over<br />Campus Spaces</h1>
                    <p>
                        We built this because honestly, the old system was a mess. 
                        Book labs, halls, and equipment without the usual headaches. 
                        It just works.
                    </p>
                    <div className="hero-actions">
                        <Link to="/facilities" className="btn-primary">
                            Browse Facilities <ArrowRight size={18} />
                        </Link>
                        {!isAuthenticated && (
                            <Link to="/register" className="btn-secondary">
                                Get Started — It's Free
                            </Link>
                        )}
                    </div>
                    <div className="hero-stats">
                        <div className="stat-item">
                            <strong>8</strong>
                            <span>Facilities Available</span>
                        </div>
                        <div className="stat-divider">•</div>
                        <div className="stat-item">
                            <strong>Real-time</strong>
                            <span>Conflict Prevention</span>
                        </div>
                        <div className="stat-divider">•</div>
                        <div className="stat-item">
                            <strong>Instant</strong>
                            <span>Email Updates</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="booking-preview">
                        <div className="preview-header">
                            <span className="preview-badge approved">Approved</span>
                            <span className="preview-time">2 mins ago</span>
                        </div>
                        <h4>Computer Lab A</h4>
                        <p>Tomorrow • 10:00 AM - 12:00 PM</p>
                        <div className="preview-user">
                            <div className="user-avatar">RS</div>
                            <span>Rahul Sharma</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="trust-bar">
                <p>Currently managing bookings for Computer Science, Physics, Sports Complex, and 5 other departments</p>
            </section>

            <section className="features">
                <div className="section-label">How it actually works</div>
                <h2>Book Anything, Skip the Drama</h2>
                
                <div className="features-grid">
                    <div className="feature-card spotlight">
                        <div className="feature-icon">
                            <Clock size={24} />
                        </div>
                        <h3>See What's Free, Right Now</h3>
                        <p>
                            Real calendars showing actual availability. No more showing up 
                            to find someone else already there. We check conflicts automatically.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <CheckCircle size={24} />
                        </div>
                        <h3>Quick Approvals</h3>
                        <p>
                            Most bookings get approved within an hour. Admins get notified 
                            instantly, and you get an email either way.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Calendar size={24} />
                        </div>
                        <h3>Your Booking History</h3>
                        <p>
                            Track everything in one place. See what's coming up, what's pending, 
                            and what you've booked before.
                        </p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon">
                            <Shield size={24} />
                        </div>
                        <h3>No Double-Bookings</h3>
                        <p>
                            The backend actually prevents conflicts. If someone books a slot 
                            before you, you'll know immediately.
                        </p>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <div className="section-label">Three steps, that's it</div>
                <h2>From Browse to Booked</h2>
                
                <div className="steps">
                    <div className="step">
                        <div className="step-number">1</div>
                        <div className="step-content">
                            <h3>Pick Your Spot</h3>
                            <p>Filter by labs, halls, equipment, or sports facilities. Search by name or browse categories.</p>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">2</div>
                        <div className="step-content">
                            <h3>Choose Your Time</h3>
                            <p>Click a date, pick an available slot. The calendar shows exactly what's free.</p>
                        </div>
                    </div>

                    <div className="step">
                        <div className="step-number">3</div>
                        <div className="step-content">
                            <h3>Get Confirmation</h3>
                            <p>Submit your request. You'll get an email when it's approved (usually pretty quick).</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta">
                <h2>Ready to stop the booking chaos?</h2>
                <p>Join students and faculty already using Campus Hub</p>
                <div className="cta-actions">
                    <Link to="/facilities" className="btn-primary">
                        Browse Facilities
                    </Link>
                    {!isAuthenticated && (
                        <Link to="/register" className="btn-secondary">
                            Create Account
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;
