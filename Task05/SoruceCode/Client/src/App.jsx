import { useState, useEffect } from 'react';
import UserSetup from './components/UserSetup';
import QRCodeDisplay from './components/QRCodeDisplay';
import QRScanner from './components/QRScanner';
import FriendList from './components/FriendList';
import ScannedUserPreview from './components/ScannedUserPreview';
import EditSocialsModal from './components/EditSocialsModal';
import { createUser, getUserById, getUserByQRCode, connectFriend, getFriends, removeFriend, updateUserSocials } from './services/api';
import { FaQrcode, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showEditSocials, setShowEditSocials] = useState(false);
  const [scannedUser, setScannedUser] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check for existing user in localStorage
    const savedUserId = localStorage.getItem('qr-connect-user-id');
    if (savedUserId) {
      loadUser(savedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async (userId) => {
    try {
      const response = await getUserById(userId);
      if (response.success) {
        setUser(response.data);
        loadFriends(userId);
      }
    } catch (error) {
      localStorage.removeItem('qr-connect-user-id');
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async (userId) => {
    try {
      const response = await getFriends(userId);
      if (response.success) {
        setFriends(response.data);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleCreateUser = async (name, socialInfo) => {
    setLoading(true);
    try {
      const response = await createUser(name, socialInfo);
      if (response.success) {
        setUser(response.data);
        localStorage.setItem('qr-connect-user-id', response.data.id);
      }
    } catch (error) {
      showNotification('Failed to create user. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (qrCode) => {
    setShowScanner(false);
    try {
      // First, fetch the scanned user's info to show preview
      const userResponse = await getUserByQRCode(qrCode);
      if (userResponse.success) {
        setScannedUser({ ...userResponse.data, qrCodeUsed: qrCode });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'User not found. Please try again.';
      showNotification(message, 'error');
    }
  };

  const handleConfirmConnect = async () => {
    if (!scannedUser) return;
    
    try {
      const response = await connectFriend(user.id, scannedUser.qrCodeUsed);
      if (response.success) {
        showNotification(`Connected with ${scannedUser.name}!`, 'success');
        loadFriends(user.id);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to connect. Please try again.';
      showNotification(message, 'error');
    } finally {
      setScannedUser(null);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      const response = await removeFriend(user.id, friendId);
      if (response.success) {
        showNotification('Friend removed', 'success');
        loadFriends(user.id);
      }
    } catch (error) {
      showNotification('Failed to remove friend', 'error');
    }
  };

  const handleEditSocials = async (socialInfo) => {
    try {
      const response = await updateUserSocials(user.id, socialInfo);
      if (response.success) {
        setUser(response.data);
        showNotification('Social info updated!', 'success');
        setShowEditSocials(false);
      }
    } catch (error) {
      showNotification('Failed to update social info', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qr-connect-user-id');
    setUser(null);
    setFriends([]);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <UserSetup onCreateUser={handleCreateUser} loading={loading} />;
  }

  return (
    <div className="app">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <header className="app-header">
        <div className="header-content">
          <div className="user-info">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div>
              <h2>{user.name}</h2>
              <span className="user-code">Code: {user.qrCode}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="main-grid">
          <div className="qr-section">
            <QRCodeDisplay user={user} onEditSocials={() => setShowEditSocials(true)} />
            <button className="scan-btn" onClick={() => setShowScanner(true)}>
              <FaUserPlus /> Add Friend
            </button>
          </div>
          
          <div className="friends-section">
            <FriendList friends={friends} onRemoveFriend={handleRemoveFriend} />
          </div>
        </div>
      </main>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {scannedUser && (
        <ScannedUserPreview 
          user={scannedUser} 
          onConfirm={handleConfirmConnect}
          onCancel={() => setScannedUser(null)}
        />
      )}

      {showEditSocials && (
        <EditSocialsModal 
          user={user}
          onSave={handleEditSocials}
          onClose={() => setShowEditSocials(false)}
        />
      )}
    </div>
  );
}

export default App;
