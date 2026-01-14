import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // This is important for handling cookies (accessToken and refreshToken)
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Add a response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the failed request was the refresh endpoint itself
      if (originalRequest.url?.includes('/refresh-token')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        await api.post('/users/refresh-token');
        processQueue(null);
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        // Refresh failed - user needs to login again
        // Don't redirect here, let the AuthContext handle it
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract backend error message from APIError response
    if (error.response?.data) {
      const backendError = error.response.data;

      // Check if response is HTML (backend sent an HTML error page)
      const isHTMLResponse = typeof backendError === 'string' && backendError.trim().startsWith('<');

      if (typeof backendError === 'string' && isHTMLResponse) {
        // Backend returned HTML error page - extract message from it or use default
        const match = backendError.match(/Error:\s*([^<\n]+)/);
        if (match && match[1]) {
          (error as AxiosError & { userMessage?: string }).userMessage = match[1].trim();
        }
      } else if (typeof backendError === 'object' && backendError !== null) {
        const errorObj = backendError as Record<string, unknown>;
        if (errorObj.message && typeof errorObj.message === 'string') {
          // Backend APIError sends: { statusCode, message, success, errors }
          (error as AxiosError & { userMessage?: string }).userMessage = errorObj.message;
        } else if (Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
          // If there are validation errors array
          (error as AxiosError & { userMessage?: string }).userMessage = errorObj.errors.join(', ');
        }
      } else if (typeof backendError === 'string' && !isHTMLResponse) {
        // Plain string error (not HTML)
        (error as AxiosError & { userMessage?: string }).userMessage = backendError;
      }
    }

    const extError = error as AxiosError & { userMessage?: string };
    
    // Add default message if no backend message available
    if (!extError.userMessage) {
      if (error.response?.status === 401) {
        extError.userMessage = 'Authentication required. Please sign in.';
      } else if (error.response?.status === 403) {
        extError.userMessage = 'You do not have permission to perform this action.';
      } else if (error.response?.status === 404) {
        extError.userMessage = 'Resource not found.';
      } else if (error.response?.status && error.response.status >= 500) {
        extError.userMessage = 'Server error. Please try again later.';
      } else if (error.request) {
        extError.userMessage = 'Network error. Please check your connection.';
      } else {
        extError.userMessage = 'An unexpected error occurred.';
      }
    }

    // Log error for debugging (only if not a 401 that we tried to refresh)
    if (error.response?.status !== 401) {
      console.error('[API Error]', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: extError.userMessage
      });
    }

    return Promise.reject(error);
  }
);

export default api;