import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const navItems = [
  { to: '/admin/dashboard',    icon: '▦', label: 'Dashboard' },
  { to: '/admin/services',     icon: '✂', label: 'Servicios' },
  { to: '/admin/hours',        icon: '🕐', label: 'Horarios' },
  { to: '/admin/appointments', icon: '📅', label: 'Citas' },
  { to: '/admin/users',        icon: '👥', label: 'Usuarios' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin') }

  return (
    <div className="min-h-screen bg-dark flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside className="w-56 bg-dark-card border-r border-dark-border flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-dark-border">
          <span className="text-gold text-xl">✂</span>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase leading-none" style={{ color: '#F2EFE9', fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
              Studio Clau
            </p>
            <p className="text-[10px] tracking-wider uppercase" style={{ color: '#A09890' }}>Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-gold bg-gold/10 border-r-2 border-gold'
                    : 'hover:bg-gold/10'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#D4B98A' : '#A09890',
              })}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-dark-border px-5 py-4">
          <p className="text-xs truncate mb-2" style={{ color: '#A09890' }}>{user?.email}</p>
          <button
            onClick={handleLogout}
            className="text-xs transition-colors w-full text-left hover:text-red-400"
            style={{ color: '#A09890' }}
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
