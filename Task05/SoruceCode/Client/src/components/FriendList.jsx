import { FaUserFriends, FaUserMinus, FaInstagram, FaSnapchatGhost, FaPhone } from 'react-icons/fa';
import './FriendList.css';

const FriendList = ({ friends, onRemoveFriend }) => {
  if (friends.length === 0) {
    return (
      <div className="friend-list empty">
        <div className="empty-state">
          <FaUserFriends className="empty-icon" />
          <h3>No Friends Yet</h3>
          <p>Scan a QR code or share yours to connect with friends!</p>
        </div>
      </div>
    );
  }

  const hasSocialInfo = (friend) => {
    return friend.socialInfo && (
      friend.socialInfo.instagram || 
      friend.socialInfo.snapchat || 
      friend.socialInfo.phone
    );
  };

  return (
    <div className="friend-list">
      <div className="friend-header">
        <FaUserFriends className="header-icon" />
        <h3>My Friends ({friends.length})</h3>
      </div>
      
      <div className="friends-container">
        {friends.map((friend) => (
          <div key={friend.id} className="friend-card">
            <img 
              src={friend.avatar} 
              alt={friend.name} 
              className="friend-avatar"
            />
            <div className="friend-info">
              <h4>{friend.name}</h4>
              {hasSocialInfo(friend) && (
                <div className="social-links">
                  {friend.socialInfo.instagram && (
                    <a 
                      href={`https://instagram.com/${friend.socialInfo.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link instagram"
                      title={`@${friend.socialInfo.instagram}`}
                    >
                      <FaInstagram />
                    </a>
                  )}
                  {friend.socialInfo.snapchat && (
                    <a 
                      href={`https://snapchat.com/add/${friend.socialInfo.snapchat}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link snapchat"
                      title={friend.socialInfo.snapchat}
                    >
                      <FaSnapchatGhost />
                    </a>
                  )}
                  {friend.socialInfo.phone && (
                    <a 
                      href={`tel:${friend.socialInfo.phone}`}
                      className="social-link phone"
                      title={friend.socialInfo.phone}
                    >
                      <FaPhone />
                    </a>
                  )}
                </div>
              )}
              <span className="connected-time">
                Connected {new Date(friend.connectedAt).toLocaleDateString()}
              </span>
            </div>
            <button 
              className="remove-btn"
              onClick={() => onRemoveFriend(friend.id)}
              title="Remove friend"
            >
              <FaUserMinus />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendList;
