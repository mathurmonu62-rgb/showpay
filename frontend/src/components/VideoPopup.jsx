import { useEffect, useRef, useState } from 'react'
import { getVideo } from '../api'

export default function VideoPopup({ onClose }) {
  const [videoUrl, setVideoUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const videoRef = useRef(null)

  useEffect(() => {
    getVideo()
      .then((res) => {
        if (res.data?.data?.video_url) {
          setVideoUrl(res.data.data.video_url)
        } else {
          onClose(true) // No video - skip popup
        }
      })
      .catch(() => onClose(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!videoUrl) return null

  return (
    <div className="popup-overlay">
      <div className="video-popup-box">
        <button className="video-close-btn" onClick={() => onClose(false)}>✕</button>
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          controls
          playsInline
          onEnded={() => onClose(true)}
        />
      </div>
    </div>
  )
}
