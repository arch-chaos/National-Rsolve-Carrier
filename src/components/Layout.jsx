import { NavLink, Outlet } from 'react-router-dom'

function Layout() {
  return (
    <div className="page">
      <header className="header">
        <NavLink className="brand" to="/">National Resolve Carrier</NavLink>
        <nav className="nav" aria-label="Primary navigation">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/services">Operations</NavLink>
          <NavLink to="/contact">Support</NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <p>© 2026 National Resolve Carrier. Internal operations portal.</p>
      </footer>
    </div>
  )
}

export default Layout
