import axios from 'axios';

// Smart Base URL: Auto-detects Localhost vs Production Vercel/Railway
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const baseURL = isLocalhost ? 'http://localhost:5000/api' : 'https://showpay-production.up.railway.app/api';

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json' 
  }
});

// Attach token and force correct environment URL on every single request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // GUARANTEE CORRECT API ROUTING FOR BOTH LOCALHOST AND PRODUCTION
  const activeBase = isLocalhost ? 'http://localhost:5000/api' : 'https://showpay-production.up.railway.app/api';
  config.baseURL = activeBase;
  if (config.url && config.url.startsWith('/')) {
    config.url = activeBase + config.url;
  } else if (config.url && !config.url.startsWith('http')) {
    config.url = activeBase + '/' + config.url;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;