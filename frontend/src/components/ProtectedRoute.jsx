import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  if (adminOnly) {
    const adminToken = localStorage.getItem('adminToken')
    if (!adminToken) return <Navigate to="/admin/login" replace />
    return children
  }

  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}
