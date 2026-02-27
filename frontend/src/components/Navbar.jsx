import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import ledger from '../assets/ledger.png'

export default function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [menuOpen, setMenuOpen] = useState(false)

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'text-white bg-white/15'
        : 'text-white/60 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav className="bg-green-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-green-950 font-bold">
            <img src={ledger} alt="Ledger" className="w-5 h-5 invert brightness-0" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-semibold text-base leading-tight"
                style={{ fontFamily: 'Playfair Display, serif' }}>
                Smart Khata AI
              </div>
            </div>
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-0.5">
            <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
            <NavLink to="/customers" className={linkClass}>Customers</NavLink>
            <NavLink to="/ai" className={linkClass}>AI Assistant</NavLink>
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-white text-sm font-medium leading-tight">{user.shop_name}</div>
              <div className="text-white/40 text-xs">{user.city}</div>
            </div>
            <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center text-amber-400 text-xs font-bold">
              {user.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <button
              onClick={logout}
              className="text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
          >
            <span className={`block w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/70 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 space-y-1">
            {[
              { to: '/', label: 'Dashboard', end: true },
              { to: '/customers', label: 'Customers' },
              { to: '/ai', label: 'AI Assistant' },
            ].map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 px-3">
              <div>
                <div className="text-white text-sm font-medium">{user.shop_name}</div>
                <div className="text-white/40 text-xs">{user.name}</div>
              </div>
              <button
                onClick={logout}
                className="text-white/50 border border-white/10 px-3 py-1.5 rounded-lg text-xs"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}