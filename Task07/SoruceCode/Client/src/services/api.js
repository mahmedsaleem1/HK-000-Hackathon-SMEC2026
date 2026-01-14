import axios from 'axios';

const API_URL = 'http://localhost:5007/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const getProfile = (username) => api.get(`/auth/profile/${username}`);
export const updateProfile = (formData) => api.put('/auth/profile', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Post apis
export const createPost = (formData) => api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getFeed = (page = 1) => api.get(`/posts/feed?page=${page}`);
export const getUserPosts = (userId) => api.get(`/posts/user/${userId}`);
export const getPost = (id) => api.get(`/posts/${id}`);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const toggleLike = (id) => api.post(`/posts/${id}/like`);

// commment apis
export const createComment = (postId, content) => api.post(`/comments/post/${postId}`, { content });
export const getComments = (postId) => api.get(`/comments/post/${postId}`);
export const deleteComment = (id) => api.delete(`/comments/${id}`);

// FolloW apis
export const followUser = (userId) => api.post(`/follow/${userId}`);
export const unfollowUser = (userId) => api.delete(`/follow/${userId}`);
export const getFollowers = (userId) => api.get(`/follow/${userId}/followers`);
export const getFollowing = (userId) => api.get(`/follow/${userId}/following`);

export default api;
