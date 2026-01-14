import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('hubToken') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/members/profile`);
            setUser(data.member);
        } catch (error) {
            console.error('Profile fetch failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const { data } = await axios.post(`${API_URL}/members/login`, { email, password });
        if (data.success) {
            localStorage.setItem('hubToken', data.token);
            setToken(data.token);
            setUser(data.member);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        return data;
    };

    const register = async (formData) => {
        const { data } = await axios.post(`${API_URL}/members/register`, formData);
        if (data.success) {
            localStorage.setItem('hubToken', data.token);
            setToken(data.token);
            setUser(data.member);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        }
        return data;
    };

    const logout = () => {
        localStorage.removeItem('hubToken');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const isAdmin = () => user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            isAdmin,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
