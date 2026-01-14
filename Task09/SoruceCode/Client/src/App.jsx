import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Facilities from './pages/Facilities'
import FacilityDetail from './pages/FacilityDetail'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading Campus Hub...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/facilities" element={<Facilities />} />
          <Route path="/facilities/:id" element={<FacilityDetail />} />
          <Route 
            path="/my-bookings" 
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
      <footer className="footer">
        <p>Campus Hub © 2026 | Resource Booking Made Simple</p>
      </footer>
    </div>
  )
}

export default App
