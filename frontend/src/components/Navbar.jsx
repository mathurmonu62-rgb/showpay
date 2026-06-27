// Navbar.jsx — Top navigation bar (used by user pages)
import { useNavigate } from 'react-router-dom'
import { NotifIcon } from './Icons'

export default function Navbar({ title = 'ShowPay' }) {
  return (
    <div className="navbar">
      <span className="navbar-brand">{title}</span>
      <div className="navbar-icon">
        <NotifIcon />
      </div>
    </div>
  )
}
