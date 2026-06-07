import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Scissors, Clock, CalendarDays, Users, LogOut } from 'lucide-react'
import { useAuth } from '../AuthContext'

const navItems = [
  { to: '/admin/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/services',     icon: Scissors,        label: 'Servicios' },
  { to: '/admin/hours',        icon: Clock,           label: 'Horarios' },
  { to: '/admin/appointments', icon: CalendarDays,    label: 'Citas' },
  { to: '/admin/users',        icon: Users,           label: 'Usuarios' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin') }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 bg-card border-r border-border flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
          <Scissors size={20} strokeWidth={1.25} className="text-primary" />
          <div>
            <p className="text-sm font-light tracking-wide text-foreground italic">
              Studio Clau
            </p>
            <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">Admin Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm transition-all duration-150 ${
                  isActive
                    ? 'text-primary bg-primary/10 border-r-2 border-primary'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                }`
              }
            >
              <Icon size={15} strokeWidth={1.5} className="shrink-0" />
              <span className="tracking-wide">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="border-t border-border px-5 py-4">
          <p className="text-xs truncate mb-3 text-muted-foreground">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs transition-colors text-muted-foreground hover:text-red-500"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Cerrar sesión
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
