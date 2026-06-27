import { useState, useEffect } from 'react'
import { getTelegramPopup } from '../api'

export default function TelegramPopup({ onClose }) {
  const [popup, setPopup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imageFinished, setImageFinished] = useState(false)

  useEffect(() => {
    getTelegramPopup()
      .then((res) => {
        const data = res.data?.data
        if (data && data.is_active) {
          setPopup(data)
          // If there is an image, show image popup first, then after 3.5 seconds show telegram link
          if (data.image_url) {
            const timer = setTimeout(() => {
              setImageFinished(true)
            }, 3500)
            return () => clearTimeout(timer)
          } else {
            setImageFinished(true)
          }
        } else {
          onClose() // Not active — skip
        }
      })
      .catch(() => onClose())
      .finally(() => setLoading(false))
  }, [])

  if (loading || !popup) return null

  return (
    <div className="mpin-popup-overlay" style={{ zIndex: 1100 }}>
      <div className="popup-box" style={{
        background: '#fff',
        borderRadius: 22,
        padding: 0,
        width: '88%',
        maxWidth: 360,
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
        animation: 'popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        {/* If image exists and hasn't finished showing yet */}
        {popup.image_url && !imageFinished ? (
          <div style={{ position: 'relative', width: '100%', height: 320, background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
            <img
              src={popup.image_url}
              alt={popup.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={() => setImageFinished(true)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(0,0,0,0.65)',
                color: '#fff',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s'
              }}
            >
              Skip ➔
            </button>
          </div>
        ) : (
          /* Telegram Link Content (appears after video pop or image pop finishes) */
          <div style={{ padding: '28px 24px 24px', animation: 'popIn 0.3s ease-out' }}>
            <div style={{ textAlign: 'center', fontSize: 44, marginBottom: 12 }}>✈️</div>
            <h2 style={{
              fontSize: 20, fontWeight: 800, textAlign: 'center',
              color: 'var(--text-dark)', marginBottom: 10
            }}>
              {popup.title || 'Join Our Telegram'}
            </h2>
            {popup.description && (
              <p style={{
                fontSize: 14, color: 'var(--text-medium)', textAlign: 'center',
                lineHeight: 1.5, marginBottom: 24
              }}>
                {popup.description}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {popup.telegram_link && (
                <a
                  href={popup.telegram_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setTimeout(() => onClose(), 500)
                  }}
                  style={{
                    width: '100%', padding: '14px 0',
                    background: 'linear-gradient(135deg, #0088cc, #006699)',
                    color: '#fff', borderRadius: 12,
                    fontWeight: 700, fontSize: 16,
                    textDecoration: 'none', textAlign: 'center',
                    display: 'block',
                    boxShadow: '0 4px 15px rgba(0,136,204,0.3)'
                  }}
                >
                  ✈️ Join / Message Telegram
                </a>
              )}
              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  background: '#f1f3f5',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 15,
                  color: 'var(--text-medium)',
                  cursor: 'pointer'
                }}
              >
                {popup.telegram_link ? 'Skip & Logout' : 'Close & Logout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
