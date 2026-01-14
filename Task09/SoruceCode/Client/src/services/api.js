import axios from 'axios';
import API_URL from '../config/api';

// Facility services
export const facilityService = {
    getAll: async (params = {}) => {
        const { data } = await axios.get(`${API_URL}/facilities`, { params });
        return data;
    },

    getById: async (id) => {
        const { data } = await axios.get(`${API_URL}/facilities/${id}`);
        return data;
    },

    getAvailability: async (id, date) => {
        const { data } = await axios.get(`${API_URL}/facilities/${id}/availability`, {
            params: { date }
        });
        return data;
    },

    // Admin functions
    getAdminList: async (params = {}) => {
        const { data } = await axios.get(`${API_URL}/facilities/admin/list`, { params });
        return data;
    },

    getStats: async () => {
        const { data } = await axios.get(`${API_URL}/facilities/admin/stats`);
        return data;
    },

    create: async (facilityData) => {
        const { data } = await axios.post(`${API_URL}/facilities`, facilityData);
        return data;
    },

    update: async (id, facilityData) => {
        const { data } = await axios.put(`${API_URL}/facilities/${id}`, facilityData);
        return data;
    },

    delete: async (id) => {
        const { data } = await axios.delete(`${API_URL}/facilities/${id}`);
        return data;
    }
};

// Reservation services
export const reservationService = {
    create: async (bookingData) => {
        const { data } = await axios.post(`${API_URL}/reservations`, bookingData);
        return data;
    },

    getMyBookings: async (params = {}) => {
        const { data } = await axios.get(`${API_URL}/reservations/my-bookings`, { params });
        return data;
    },

    getById: async (id) => {
        const { data } = await axios.get(`${API_URL}/reservations/${id}`);
        return data;
    },

    cancel: async (id) => {
        const { data } = await axios.put(`${API_URL}/reservations/${id}/cancel`);
        return data;
    },

    getCalendar: async (facilityId, month, year) => {
        const { data } = await axios.get(`${API_URL}/reservations/calendar`, {
            params: { facilityId, month, year }
        });
        return data;
    },

    // Admin functions
    getAll: async (params = {}) => {
        const { data } = await axios.get(`${API_URL}/reservations/admin/all`, { params });
        return data;
    },

    getStats: async () => {
        const { data } = await axios.get(`${API_URL}/reservations/admin/stats`);
        return data;
    },

    updateStatus: async (id, status, adminRemarks = '') => {
        const { data } = await axios.put(`${API_URL}/reservations/admin/${id}/status`, {
            status,
            adminRemarks
        });
        return data;
    }
};

// Member services (Admin)
export const memberService = {
    getAll: async (params = {}) => {
        const { data } = await axios.get(`${API_URL}/members/all`, { params });
        return data;
    },

    updateRole: async (id, role, isActive) => {
        const { data } = await axios.put(`${API_URL}/members/${id}/role`, { role, isActive });
        return data;
    }
};
