import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './store/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateTask from './pages/CreateTask';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';
import MyTasks from './pages/MyTasks';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/task/:id" element={<TaskDetail />} />
              <Route path="/profile/:userId?" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              <Route path="/create-task" element={
                <ProtectedRoute><CreateTask /></ProtectedRoute>
              } />
              <Route path="/my-tasks" element={
                <ProtectedRoute><MyTasks /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
