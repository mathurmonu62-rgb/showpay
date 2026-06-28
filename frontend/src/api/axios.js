import axios from 'axios';

// Asli Backend (Railway) ka full URL hardcoded to prevent Vercel 404 errors
const baseURL = 'https://showpay-production.up.railway.app/api';

const API = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json' 
  }
});

// Attach token and force absolute Railway URL on every single request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // GUARANTEE NO RELATIVE PATH / VERCEL 404 ERRORS CAN EVER OCCUR
  const railwayBase = 'https://showpay-production.up.railway.app/api';
  config.baseURL = railwayBase;
  if (config.url && config.url.startsWith('/')) {
    config.url = railwayBase + config.url;
  } else if (config.url && !config.url.startsWith('http')) {
    config.url = railwayBase + '/' + config.url;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;