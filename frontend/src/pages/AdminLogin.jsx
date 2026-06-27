import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminLoginUser } from '../api'
import '../css/admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setErrorMsg('Email and password are required')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await adminLoginUser({ email: form.email, password: form.password })
      const { token, admin } = res.data.data
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminInfo', JSON.stringify(admin))
      navigate('/admin')
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <h1>ShowPay</h1>
          <p>Admin Panel</p>
        </div>

        {errorMsg && <div className="admin-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@showpay.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>
          <div className="admin-input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <button className="admin-login-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  )
}
