import { HomeIcon, DepositIcon, UpiIcon, TeamIcon, MeIcon } from './Icons'

const navItems = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'deposit', label: 'Deposit', Icon: DepositIcon },
  { id: 'upi', label: 'UPI', Icon: UpiIcon },
  { id: 'team', label: 'Team', Icon: TeamIcon },
  { id: 'me', label: 'Me', Icon: MeIcon }
]

export default function BottomNav({ active = 'home' }) {
  return (
    <nav className="bottom-nav">
      {navItems.map(({ id, label, Icon }) => (
        <div key={id} className={`nav-item ${active === id ? 'active' : ''}`}>
          <div className="nav-icon">
            <Icon filled={active === id} />
          </div>
          <span className="nav-label">{label}</span>
        </div>
      ))}
    </nav>
  )
}
