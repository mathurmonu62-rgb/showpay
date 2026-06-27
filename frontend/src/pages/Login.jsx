import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api'
import { PhoneIcon, LockIcon } from '../components/Icons'
import '../css/login.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ mobile: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (e) => {
    setErrorMsg('')
    const { name, value } = e.target
    if (name === 'mobile' && !/^\d*$/.test(value)) return
    if (name === 'mobile' && value.length > 10) return
    if (name === 'password' && value.length > 10) return
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (form.mobile.length !== 10) {
      setErrorMsg('Mobile number must be exactly 10 digits')
      return
    }
    if (form.password.length === 0) {
      setErrorMsg('Please enter your password')
      return
    }

    setLoading(true)
    try {
      const res = await loginUser({ mobile: form.mobile, password: form.password })
      const { token, user } = res.data.data

      // Save to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('mobile', form.mobile)
      localStorage.setItem('password', form.password)

      navigate('/home')
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Header */}
      <div className="login-header">
        <h1>LOG IN</h1>
      </div>

      {/* Body */}
      <form className="login-body" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="login-error">{errorMsg}</div>
        )}

        <div className="input-group">
          <span className="input-icon"><PhoneIcon /></span>
          <input
            type="tel"
            name="mobile"
            placeholder="Enter Your Phone Number"
            value={form.mobile}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
          />
        </div>

        <div className="input-group">
          <span className="input-icon"><LockIcon /></span>
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={form.password}
            onChange={handleChange}
            maxLength={10}
            autoComplete="current-password"
          />
        </div>

        <div className="forgot-password">
          <a href="#">Forget Password</a>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading && <span className="btn-spinner" />}
            LOG IN
          </button>
        </div>
      </form>
    </div>
  )
}
