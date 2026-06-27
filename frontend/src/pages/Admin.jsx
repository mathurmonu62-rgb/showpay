import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getDashboard, getAllUsers, getUserDetail, getSettings, updateSettings,
  uploadSlider, deleteSlider, getSliders,
  uploadVideo, deleteVideo, getVideo,
  getNotices, createNotice, deleteNotice,
  getReport, downloadPDF,
  getAdminPopup, updateTelegramPopup,
  getAdminBanner, uploadBanner, deleteBanner
} from '../api'
import UserCard from '../components/UserCard'
import '../css/admin.css'

const MENU = [
  { id: 'dashboard',  label: 'Dashboard',       icon: '📊' },
  { id: 'users',      label: 'User List',        icon: '👥' },
  { id: 'slider',     label: 'Slider Images',    icon: '🖼️' },
  { id: 'video',      label: 'Popup Video',      icon: '🎬' },
  { id: 'popup',      label: 'Telegram Popup',   icon: '✈️' },
  { id: 'banner',     label: 'Banner',           icon: '🏷️' },
  { id: 'notices',    label: 'Notices',          icon: '📢' },
  { id: 'settings',   label: 'Settings',         icon: '⚙️' },
  { id: 'reports',    label: 'Reports',          icon: '📋' },
]

export default function Admin() {
  const navigate = useNavigate()
  const [page, setPage] = useState('dashboard')
  const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar open">
        <div className="sidebar-brand">ShowPay<span>Admin Panel</span></div>
        <nav className="sidebar-menu">
          {MENU.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="sidebar-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ef4444' }}>
            <span className="sidebar-icon">🚪</span>Logout
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-header">
          <h2>{MENU.find(m => m.id === page)?.label}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--text-light)' }}>{adminInfo.name || 'Admin'}</span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        <div className="admin-content">
          {page === 'dashboard' && <Dashboard />}
          {page === 'users'     && <UserList />}
          {page === 'slider'    && <SliderManager />}
          {page === 'video'     && <VideoManager />}
          {page === 'popup'     && <PopupManager />}
          {page === 'banner'    && <BannerManager />}
          {page === 'notices'   && <NoticesManager />}
          {page === 'settings'  && <SettingsManager />}
          {page === 'reports'   && <Reports />}
        </div>
      </main>
    </div>
  )
}

/* ─── DASHBOARD ──────────────────────────────────────────────────────────────── */
function Dashboard() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    getDashboard().then(r => setStats(r.data.data)).catch(() => {})
  }, [])

  const cards = [
    { label: 'Total Users',    value: stats?.totalUsers     ?? '—', color: '#1a9ef5' },
    { label: 'Pending Users',  value: stats?.pendingUsers   ?? '—', color: '#f59e0b' },
    { label: 'Completed',      value: stats?.completedUsers ?? '—', color: '#22c55e' },
    { label: "Today's Logins", value: stats?.todayLogins    ?? '—', color: '#8b5cf6' },
    { label: 'Total Sliders',  value: stats?.totalSliders   ?? '—', color: '#06b6d4' },
    { label: 'Total Videos',   value: stats?.totalVideos    ?? '—', color: '#ef4444' },
  ]

  return (
    <div>
      <div className="dashboard-cards">
        {cards.map((c, i) => (
          <div className="dash-card" key={c.label} style={{ borderLeftColor: c.color }}>
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-value">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Latest Logins */}
      {stats?.latest?.length > 0 && (
        <div className="admin-table-wrap">
          <div style={{ padding: '16px 20px', fontWeight: 700, fontSize: 15, borderBottom: '1px solid var(--border)' }}>
            Latest Logins
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Mobile</th><th>Status</th><th>MPIN</th><th>Login Count</th><th>Last Login</th></tr>
            </thead>
            <tbody>
              {stats.latest.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.mobile}</strong></td>
                  <td>
                    <span style={{
                      background: u.status === 'completed' ? '#dcfce7' : '#fef9c3',
                      color: u.status === 'completed' ? '#166534' : '#92400e',
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                    }}>{u.status?.toUpperCase()}</span>
                  </td>
                  <td>{u.mpin || <span style={{ color: 'var(--text-light)' }}>Not set</span>}</td>
                  <td>{u.login_count}</td>
                  <td>{u.last_login ? new Date(u.last_login).toLocaleString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── USER LIST ──────────────────────────────────────────────────────────────── */
function UserList() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const fetchUsers = useCallback(() => {
    setLoading(true)
    getAllUsers({ search, date, status: statusFilter, page: currentPage, limit: 20 })
      .then(r => {
        setUsers(r.data.data.users || [])
        setTotalPages(r.data.data.totalPages || 1)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [search, date, statusFilter, currentPage])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleUserClick = (user) => setSelectedUser(user)

  const handleDownloadPDF = async () => {
    try {
      const res = await downloadPDF({ status: statusFilter })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `showpay_users_${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('PDF download failed') }
  }

  const handleGmail = (u, e) => {
    e.stopPropagation()
    const subject = encodeURIComponent('ShowPay User Details')
    const body = encodeURIComponent(`Mobile Number: ${u.mobile}\nPassword: ${u.password}\nMPIN: ${u.mpin || 'Not Set'}`)
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank')
  }

  return (
    <div>
      {selectedUser && <UserCard user={selectedUser} onClose={() => setSelectedUser(null)} />}

      <div className="admin-table-wrap">
        <div className="table-toolbar">
          <input
            className="table-search"
            placeholder="Search by mobile..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
          />
          <input
            type="date"
            className="date-filter"
            value={date}
            onChange={(e) => { setDate(e.target.value); setCurrentPage(1) }}
          />
          <select
            className="date-filter"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          {(search || date || statusFilter) && (
            <button className="page-btn" onClick={() => { setSearch(''); setDate(''); setStatusFilter(''); setCurrentPage(1) }}>Clear</button>
          )}
          <button className="btn-pdf" onClick={handleDownloadPDF}>📥 Download PDF</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th><th>Mobile</th><th>Password</th><th>MPIN</th>
                <th>Status</th><th>Count</th><th>Date</th><th>Time</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32 }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-light)' }}>No records found</td></tr>
              ) : users.map((u, i) => {
                const dt = new Date(u.last_login || u.created_at)
                return (
                  <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => handleUserClick(u)}>
                    <td>{(currentPage - 1) * 20 + i + 1}</td>
                    <td><strong>{u.mobile}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>{u.password}</td>
                    <td>{u.mpin || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                    <td>
                      <span style={{
                        background: u.status === 'completed' ? '#dcfce7' : '#fef9c3',
                        color: u.status === 'completed' ? '#166534' : '#92400e',
                        padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600
                      }}>{u.status?.toUpperCase()}</span>
                    </td>
                    <td>{u.login_count}</td>
                    <td>{dt.toLocaleDateString('en-IN')}</td>
                    <td>{dt.toLocaleTimeString('en-IN')}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleGmail(u, e)}
                        style={{
                          padding: '4px 10px', background: '#ea4335',
                          color: '#fff', border: 'none', borderRadius: 6,
                          fontSize: 12, cursor: 'pointer', fontWeight: 600
                        }}
                      >📧 Gmail</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>←</button>
            <span style={{ fontSize: 14 }}>{currentPage} / {totalPages}</span>
            <button className="page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>→</button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── SLIDER MANAGER ─────────────────────────────────────────────────────────── */
function SliderManager() {
  const [slides, setSlides] = useState([])
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => { getSliders().then(r => setSlides(r.data.data || [])).catch(() => {}) }, [])

  const showAlert = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3000) }

  const handleUpload = async () => {
    if (!file) return showAlert('Please select an image', 'error')
    const fd = new FormData(); fd.append('image', file)
    setUploading(true)
    try {
      const r = await uploadSlider(fd)
      setSlides(prev => [r.data.data, ...prev])
      setFile(null)
      showAlert('Slider uploaded! Live on Home Page.')
    } catch { showAlert('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this slider image?')) return
    try { await deleteSlider(id); setSlides(prev => prev.filter(s => s.id !== id)); showAlert('Deleted!') }
    catch { showAlert('Delete failed', 'error') }
  }

  return (
    <div>
      {alert && <div className={`admin-alert ${alert.type}`}>{alert.msg}</div>}
      <div className="upload-section">
        <div className="upload-title">Upload Slider Image</div>
        <div className="upload-drop-area" onClick={() => document.getElementById('sliderInput').click()}>
          <div className="upload-drop-icon">🖼️</div>
          <div className="upload-drop-text">{file ? file.name : 'Click to select image (JPG, PNG, WEBP)'}</div>
          <input id="sliderInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button className="btn-upload" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading...' : '⬆️ Upload Slider'}
        </button>
      </div>
      <div className="upload-section">
        <div className="upload-title">Current Sliders ({slides.length})</div>
        {slides.length === 0 ? <p style={{ color: 'var(--text-light)', fontSize: 14 }}>No sliders uploaded yet</p> : (
          <div className="slider-grid">
            {slides.map((s) => (
              <div className="slider-thumb" key={s.id}>
                <img src={s.image_url} alt="slide" />
                <button className="slider-thumb-del" onClick={() => handleDelete(s.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── VIDEO MANAGER ──────────────────────────────────────────────────────────── */
function VideoManager() {
  const [video, setVideo] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => { getVideo().then(r => setVideo(r.data.data)).catch(() => {}) }, [])
  const showAlert = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3000) }

  const handleUpload = async () => {
    if (!file) return showAlert('Please select a video', 'error')
    const fd = new FormData(); fd.append('video', file)
    setUploading(true)
    try {
      const r = await uploadVideo(fd); setVideo(r.data.data); setFile(null)
      showAlert('Video uploaded! Users will see it on next Home load.')
    } catch { showAlert('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  const handleDelete = async () => {
    if (!video || !confirm('Delete current popup video?')) return
    try { await deleteVideo(video.id); setVideo(null); showAlert('Video deleted!') }
    catch { showAlert('Delete failed', 'error') }
  }

  return (
    <div>
      {alert && <div className={`admin-alert ${alert.type}`}>{alert.msg}</div>}
      <div className="upload-section">
        <div className="upload-title">Upload Popup Video</div>
        <div className="upload-drop-area" onClick={() => document.getElementById('videoInput').click()}>
          <div className="upload-drop-icon">🎬</div>
          <div className="upload-drop-text">{file ? file.name : 'Click to select video (MP4, max 100MB)'}</div>
          <input id="videoInput" type="file" accept="video/mp4,video/webm" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button className="btn-upload" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading...' : '⬆️ Upload Video'}
        </button>
      </div>
      {video && (
        <div className="upload-section">
          <div className="upload-title">Current Popup Video</div>
          <video src={video.video_url} controls style={{ width: '100%', maxHeight: 280, borderRadius: 8 }} />
          <button className="btn-pdf" style={{ marginTop: 12 }} onClick={handleDelete}>🗑️ Delete Video</button>
        </div>
      )}
    </div>
  )
}

/* ─── POPUP (Telegram) MANAGER ───────────────────────────────────────────────── */
function PopupManager() {
  const [form, setForm] = useState({ title: '', description: '', telegram_link: '', is_active: false })
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    getAdminPopup().then(r => {
      if (r.data?.data) {
        const d = r.data.data
        setForm({ title: d.title || '', description: d.description || '', telegram_link: d.telegram_link || '', is_active: d.is_active || false })
        setPreview(d.image_url || '')
      }
    }).catch(() => {})
  }, [])

  const showAlert = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3000) }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('telegram_link', form.telegram_link)
      fd.append('is_active', String(form.is_active))
      if (imageFile) fd.append('image', imageFile)
      await updateTelegramPopup(fd)
      showAlert('Telegram popup updated! Changes are live.')
    } catch { showAlert('Save failed', 'error') }
    finally { setSaving(false) }
  }

  return (
    <div className="settings-form" style={{ maxWidth: 560 }}>
      {alert && <div className={`admin-alert ${alert.type}`}>{alert.msg}</div>}

      <div className="form-group">
        <label>Enable Telegram Popup</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
            style={{
              width: 48, height: 26, borderRadius: 13,
              background: form.is_active ? '#22c55e' : '#d1d5db',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
            }}
          >
            <div style={{
              position: 'absolute', top: 3,
              left: form.is_active ? 25 : 3,
              width: 20, height: 20,
              borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: form.is_active ? '#22c55e' : 'var(--text-light)' }}>
            {form.is_active ? 'Active' : 'Disabled'}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label>Title</label>
        <input placeholder="Join Our Telegram" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <input placeholder="Get latest updates..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Telegram Link</label>
        <input placeholder="https://t.me/your_channel" value={form.telegram_link} onChange={e => setForm(f => ({ ...f, telegram_link: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Popup Image (optional)</label>
        <div className="upload-drop-area" onClick={() => document.getElementById('popupImg').click()} style={{ padding: 20 }}>
          {preview ? <img src={preview} alt="preview" style={{ maxHeight: 120, borderRadius: 8 }} /> : (
            <><div className="upload-drop-icon">🖼️</div><div className="upload-drop-text">{imageFile ? imageFile.name : 'Click to select image'}</div></>
          )}
          <input id="popupImg" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { setImageFile(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])) }} />
        </div>
      </div>
      <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save Popup Settings'}</button>
    </div>
  )
}

/* ─── BANNER MANAGER ─────────────────────────────────────────────────────────── */
function BannerManager() {
  const [banner, setBanner] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => { getAdminBanner().then(r => setBanner(r.data?.data)).catch(() => {}) }, [])
  const showAlert = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3000) }

  const handleUpload = async () => {
    if (!file) return showAlert('Please select an image', 'error')
    const fd = new FormData(); fd.append('image', file)
    setUploading(true)
    try {
      const r = await uploadBanner(fd); setBanner(r.data?.data); setFile(null)
      showAlert('Banner uploaded! Live on Home Page.')
    } catch { showAlert('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  const handleDelete = async () => {
    if (!banner || !confirm('Delete banner?')) return
    try { await deleteBanner(banner.id); setBanner(null); showAlert('Banner deleted!') }
    catch { showAlert('Delete failed', 'error') }
  }

  return (
    <div>
      {alert && <div className={`admin-alert ${alert.type}`}>{alert.msg}</div>}
      <div className="upload-section">
        <div className="upload-title">Upload Home Page Banner</div>
        <div className="upload-drop-area" onClick={() => document.getElementById('bannerInput').click()}>
          <div className="upload-drop-icon">🏷️</div>
          <div className="upload-drop-text">{file ? file.name : 'Click to select banner image'}</div>
          <input id="bannerInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button className="btn-upload" onClick={handleUpload} disabled={uploading || !file}>
          {uploading ? 'Uploading...' : '⬆️ Upload Banner'}
        </button>
      </div>
      {banner && (
        <div className="upload-section">
          <div className="upload-title">Current Banner</div>
          <img src={banner.image_url} alt="banner" style={{ width: '100%', borderRadius: 8, maxHeight: 120, objectFit: 'cover' }} />
          <button className="btn-pdf" style={{ marginTop: 12 }} onClick={handleDelete}>🗑️ Delete Banner</button>
        </div>
      )}
    </div>
  )
}

/* ─── NOTICES MANAGER ────────────────────────────────────────────────────────── */
function NoticesManager() {
  const [notices, setNotices] = useState([])
  const [form, setForm] = useState({ title: '', description: '' })
  const [alert, setAlert] = useState(null)

  useEffect(() => { getNotices().then(r => setNotices(r.data.data || [])).catch(() => {}) }, [])
  const showAlert = (msg, type = 'success') => { setAlert({ msg, type }); setTimeout(() => setAlert(null), 3000) }

  const handleCreate = async () => {
    if (!form.title) return showAlert('Title is required', 'error')
    try { const r = await createNotice(form); setNotices(prev => [r.data.data, ...prev]); setForm({ title: '', description: '' }); showAlert('Notice created!') }
    catch { showAlert('Failed to create notice', 'error') }
  }

  const handleDelete = async (id) => {
    try { await deleteNotice(id); setNotices(prev => prev.filter(n => n.id !== id)); showAlert('Notice deleted!') }
    catch { showAlert('Delete failed', 'error') }
  }

  return (
    <div>
      {alert && <div className={`admin-alert ${alert.type}`}>{alert.msg}</div>}
      <div className="upload-section">
        <div className="upload-title">Create Notice</div>
        <div className="form-group"><label>Title</label><input placeholder="Notice title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label>Description (optional)</label><input placeholder="Notice description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <button className="btn-save" onClick={handleCreate}>➕ Create Notice</button>
      </div>
      <div className="notice-list">
        {notices.map(n => (
          <div className="notice-item" key={n.id}>
            <div><div className="notice-item-title">{n.title}</div>{n.description && <div className="notice-item-desc">{n.description}</div>}</div>
            <button className="btn-del" onClick={() => handleDelete(n.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── SETTINGS MANAGER ───────────────────────────────────────────────────────── */
function SettingsManager() {
  const [form, setForm] = useState({
    usdt_ratio: '', bonus_ratio: '', inr_bonus_ratio: '', tutorial_link: '',
    mpin_popup_delay: 2,
    slider_enabled: true, video_popup_enabled: true,
    telegram_popup_enabled: false, banner_enabled: true
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getSettings().then(r => { if (r.data?.data) setForm(f => ({ ...f, ...r.data.data })) }).catch(() => {})
  }, [])

  const handleSave = async () => {
    try { await updateSettings(form); setSaved(true); setTimeout(() => setSaved(false), 3000) }
    catch { alert('Failed to save settings') }
  }

  const Toggle = ({ field, label }) => (
    <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ marginBottom: 0 }}>{label}</label>
      <div
        onClick={() => setForm(f => ({ ...f, [field]: !f[field] }))}
        style={{
          width: 48, height: 26, borderRadius: 13,
          background: form[field] ? '#22c55e' : '#d1d5db',
          position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: form[field] ? 25 : 3,
          width: 20, height: 20,
          borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  )

  return (
    <div className="settings-form">
      {saved && <div className="admin-alert success">✅ Settings saved successfully!</div>}

      <div className="upload-title" style={{ marginBottom: 20 }}>Display Settings</div>
      <Toggle field="slider_enabled" label="Slider ON/OFF" />
      <Toggle field="video_popup_enabled" label="Video Popup ON/OFF" />
      <Toggle field="telegram_popup_enabled" label="Telegram Popup ON/OFF" />
      <Toggle field="banner_enabled" label="Banner ON/OFF" />

      <div className="upload-title" style={{ margin: '24px 0 16px' }}>MPIN Popup Delay</div>
      <div className="form-group">
        <label>Delay (seconds)</label>
        <input type="number" min="0" max="30" placeholder="2" value={form.mpin_popup_delay || 2} onChange={e => setForm(f => ({ ...f, mpin_popup_delay: parseInt(e.target.value) || 2 }))} />
      </div>

      <div className="upload-title" style={{ margin: '24px 0 16px' }}>Ratio Settings</div>
      {[
        { key: 'usdt_ratio', label: 'USDT Ratio (INR)', placeholder: '107.61' },
        { key: 'bonus_ratio', label: 'INR Bonus Ratio (%)', placeholder: '4' },
        { key: 'inr_bonus_ratio', label: 'Bonus Ratio (%)', placeholder: '2' },
        { key: 'tutorial_link', label: 'Tutorial Link URL', placeholder: 'https://...' }
      ].map(({ key, label, placeholder }) => (
        <div className="form-group" key={key}>
          <label>{label}</label>
          <input placeholder={placeholder} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
        </div>
      ))}

      <button className="btn-save" onClick={handleSave}>💾 Save All Settings</button>
    </div>
  )
}

/* ─── REPORTS ────────────────────────────────────────────────────────────────── */
function Reports() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [data, setData] = useState([])

  const fetchReport = () => {
    setLoading(true)
    getReport({ startDate: startDate || undefined, endDate: endDate || undefined })
      .then(r => setData(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  const handlePDF = async () => {
    setPdfLoading(true)
    try {
      const res = await downloadPDF({ startDate: startDate || undefined, endDate: endDate || undefined })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `showpay_report_${startDate || 'all'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch { alert('PDF download failed') }
    finally { setPdfLoading(false) }
  }

  const downloadCSV = () => {
    const csv = [
      'Mobile,Password,MPIN,Login Time',
      ...data.map(u => `${u.mobile},${u.password},${u.mpin || 'N/A'},${new Date(u.login_time).toLocaleString()}`)
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `report_${Date.now()}.csv`
    link.click()
  }

  return (
    <div>
      <div className="upload-section">
        <div className="upload-title">Generate Report</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button className="btn-save" onClick={fetchReport} disabled={loading}>{loading ? 'Loading...' : '📊 Generate'}</button>
          {data.length > 0 && <>
            <button className="btn-upload" onClick={downloadCSV}>📥 CSV</button>
            <button className="btn-pdf" onClick={handlePDF} disabled={pdfLoading}>{pdfLoading ? 'Generating...' : '📄 PDF'}</button>
          </>}
        </div>
      </div>

      {data.length > 0 && (
        <div className="admin-table-wrap">
          <div style={{ padding: '12px 20px', fontWeight: 600, fontSize: 14, color: 'var(--text-medium)' }}>{data.length} records found</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>#</th><th>Mobile</th><th>Password</th><th>MPIN</th><th>Login Date &amp; Time</th></tr>
              </thead>
              <tbody>
                {data.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td><strong>{u.mobile}</strong></td>
                    <td style={{ fontFamily: 'monospace' }}>{u.password}</td>
                    <td>{u.mpin || <span style={{ color: 'var(--text-light)' }}>N/A</span>}</td>
                    <td>{new Date(u.login_time).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
