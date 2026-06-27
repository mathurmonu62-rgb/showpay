import axios from 'axios'

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const loginUser       = (data) => API.post('/auth/login', data)
export const adminLoginUser  = (data) => API.post('/auth/admin/login', data)

// ─── MPIN ─────────────────────────────────────────────────────────────────────
export const saveMpin = (data) => API.post('/mpin', data)

// ─── SLIDERS ──────────────────────────────────────────────────────────────────
export const getSliders   = ()   => API.get('/sliders')
export const uploadSlider = (fd) => API.post('/sliders', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteSlider = (id) => API.delete(`/sliders/${id}`)

// ─── VIDEOS ───────────────────────────────────────────────────────────────────
export const getVideo     = ()   => API.get('/videos')
export const uploadVideo  = (fd) => API.post('/videos', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteVideo  = (id) => API.delete(`/videos/${id}`)

// ─── POPUP (Telegram) ─────────────────────────────────────────────────────────
export const getTelegramPopup    = ()   => API.get('/popup')
export const getAdminPopup       = ()   => API.get('/popup/admin')
export const updateTelegramPopup = (fd) => API.put('/popup/admin', fd, { headers: { 'Content-Type': 'multipart/form-data' } })

// ─── BANNER ───────────────────────────────────────────────────────────────────
export const getBanner      = ()   => API.get('/banner')
export const getAdminBanner = ()   => API.get('/admin/banner')
export const uploadBanner   = (fd) => API.post('/admin/banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteBanner   = (id) => API.delete(`/admin/banner/${id}`)

// ─── ADMIN ────────────────────────────────────────────────────────────────────
export const getDashboard   = ()       => API.get('/admin/dashboard')
export const getAllUsers     = (params) => API.get('/admin/users', { params })
export const getUserDetail   = (id)    => API.get(`/admin/users/${id}`)
export const getSettings    = ()       => API.get('/admin/settings')
export const updateSettings = (data)   => API.put('/admin/settings', data)
export const getNotices     = ()       => API.get('/admin/notices')
export const createNotice   = (data)   => API.post('/admin/notices', data)
export const deleteNotice   = (id)     => API.delete(`/admin/notices/${id}`)

// ─── REPORTS ──────────────────────────────────────────────────────────────────
export const getReport    = (params) => API.get('/reports', { params })
export const downloadPDF  = (params) => API.get('/reports/pdf', { params, responseType: 'blob' })

export default API
