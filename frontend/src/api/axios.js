import axios from 'axios';

// Base URL pointing to the production Railway backend
const baseURL = import.meta.env.VITE_API_URL || 'https://showpay-production.up.railway.app/api';

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
