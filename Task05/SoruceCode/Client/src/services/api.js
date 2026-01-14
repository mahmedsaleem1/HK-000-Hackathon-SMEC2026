import axios from 'axios';

const API_BASE = 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const createUser = async (name, socialInfo = {}) => {
  const response = await api.post('/users', { name, socialInfo });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getUserByQRCode = async (qrCode) => {
  const response = await api.get(`/users/qr/${qrCode}`);
  return response.data;
};

export const updateUserSocials = async (userId, socialInfo) => {
  const response = await api.put(`/users/${userId}/socials`, { socialInfo });
  return response.data;
};

export const connectFriend = async (userId, friendQRCode) => {
  const response = await api.post('/friends/connect', { userId, friendQRCode });
  return response.data;
};

export const getFriends = async (userId) => {
  const response = await api.get(`/friends/${userId}`);
  return response.data;
};

export const removeFriend = async (userId, friendId) => {
  const response = await api.delete('/friends/remove', { 
    data: { userId, friendId } 
  });
  return response.data;
};

export default api;
