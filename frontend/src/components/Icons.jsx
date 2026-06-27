// Phone icon SVG
export const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

// Lock icon SVG
export const LockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    <circle cx="12" cy="16" r="1"/>
  </svg>
)

// Home icon
export const HomeIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? '#0084ff' : '#8e95a2'} stroke="none">
    <path d="M12 3L3 10.5V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9.5L12 3zm-2 16v-6h4v6h-4z"/>
  </svg>
)

// Deposit icon
export const DepositIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={filled ? '#0084ff' : '#8e95a2'} />
    <path d="M8 10h6m-2-2 2 2-2 2M16 14h-6m2-2-2 2 2 2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// UPI icon
export const UpiIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? '#0084ff' : '#8e95a2'} stroke="none">
    <path d="M19 6h-3V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-9-2h4v2h-4V4zm9 16H5V11h14v9zm0-11H5V8h14v1z"/>
    <path d="M10 13h4v2h-4z" fill={filled ? '#0084ff' : '#8e95a2'} />
  </svg>
)

// Team icon
export const TeamIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? '#0084ff' : '#8e95a2'} stroke="none">
    <path d="M14 4h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6V4z" opacity="0.6"/>
    <path d="M4 8h10v12H4z"/>
    <path d="M12 20H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1z"/>
  </svg>
)

// Me/Profile icon
export const MeIcon = ({ filled }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? '#0084ff' : '#8e95a2'} stroke="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 2.15.68 4.14 1.85 5.78L3 22l4.22-.85C8.75 21.68 10.33 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
  </svg>
)

// Bell / notification icon (matching the screenshot exactly)
export const NotifIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0084ff" strokeWidth="2.2">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    <path d="M12 8v4" strokeLinecap="round"/>
    <path d="M12 16h.01" strokeLinecap="round" strokeWidth="3"/>
  </svg>
)

// Arrow right
export const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0084ff" strokeWidth="2.2">
    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Chat icon
export const ChatIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" stroke="none">
    <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.39 5.09L2 22l5.06-1.35A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
  </svg>
)

// Check icon
export const CheckIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
