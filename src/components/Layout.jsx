import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/fleet', label: 'Fleet', icon: '⊞' },
  { to: '/drivers', label: 'Drivers', icon: '⊡' },
  { to: '/routes', label: 'Routes', icon: '⇌' },
  { to: '/reports', label: 'Reports', icon: '⊟' },
  { to: '/support', label: 'Support', icon: '◎' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">NRC</div>
          <div className="brand-text">
            <strong>National Resolve</strong>
            <small>Carrier TMS</small>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <strong>{user?.username}</strong>
              <small>{user?.role}</small>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main-area">
        <Outlet />
      </main>
    </div>
  )
}
