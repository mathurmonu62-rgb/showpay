import { useState, useEffect, useRef } from 'react'
import { getSliders } from '../api'

export default function Slider() {
  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    getSliders()
      .then((res) => {
        if (res.data?.data?.length > 0) setSlides(res.data.data)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div className="slider-section" style={{ height: 200, background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff', padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>SECURITY ALERT / ANTI-SCAM NOTICE</div>
          <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>Our WhatsApp is for order inquiries only.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="slider-section">
      <div
        className="slider-wrapper"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div className="slide-item" key={slide.id}>
            <img src={slide.image_url} alt={`Slide ${i + 1}`} />
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="slider-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`slider-dot ${i === current ? 'active' : ''}`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
