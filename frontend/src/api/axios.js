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

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;