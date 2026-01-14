const { users, friendConnections } = require('../data/store');

const connectFriend = (req, res) => {
  try {
    const { userId, friendQRCode } = req.body;

    if (!userId || !friendQRCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and friend QR code are required' 
      });
    }

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let friend = null;
    users.forEach((u) => {
      if (u.qrCode === friendQRCode.toUpperCase()) {
        friend = u;
      }
    });

    if (!friend) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with this QR code' 
      });
    }

    if (friend.id === userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'You cannot add yourself as a friend' 
      });
    }

    const userFriends = friendConnections.get(userId) || [];
    if (userFriends.some(f => f.id === friend.id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already connected with this user' 
      });
    }
    const connectionTime = new Date().toISOString();
    
    userFriends.push({ 
      id: friend.id, 
      connectedAt: connectionTime 
    });
    friendConnections.set(userId, userFriends);

    const friendFriends = friendConnections.get(friend.id) || [];
    friendFriends.push({ 
      id: user.id, 
      connectedAt: connectionTime 
    });
    friendConnections.set(friend.id, friendFriends);

    res.json({ 
      success: true, 
      message: `You are now connected with ${friend.name}!`,
      data: { 
        friend: { 
          id: friend.id, 
          name: friend.name, 
          avatar: friend.avatar,
          socialInfo: friend.socialInfo
        } 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFriends = (req, res) => {
  try {
    const { userId } = req.params;

    const user = users.get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const friendConnects = friendConnections.get(userId) || [];
    
    const friends = friendConnects.map(fc => {
      const friendUser = users.get(fc.id);
      if (friendUser) {
        return {
          id: friendUser.id,
          name: friendUser.name,
          avatar: friendUser.avatar,
          socialInfo: friendUser.socialInfo,
          connectedAt: fc.connectedAt
        };
      }
      return null;
    }).filter(f => f !== null);

    res.json({ success: true, data: friends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const removeFriend = (req, res) => {
  try {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and friend ID are required' 
      });
    }

    let userFriends = friendConnections.get(userId) || [];
    userFriends = userFriends.filter(f => f.id !== friendId);
    friendConnections.set(userId, userFriends);

    let friendFriends = friendConnections.get(friendId) || [];
    friendFriends = friendFriends.filter(f => f.id !== userId);
    friendConnections.set(friendId, friendFriends);

    res.json({ success: true, message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  connectFriend,
  getFriends,
  removeFriend
};
