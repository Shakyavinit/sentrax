import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentrax_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sentrax_token');
      localStorage.removeItem('sentrax_user');
      // Dispatch custom event so app can react if needed
      window.dispatchEvent(new Event('sentrax_auth_failed'));
    }
    return Promise.reject(error);
  }
);

export default api;
