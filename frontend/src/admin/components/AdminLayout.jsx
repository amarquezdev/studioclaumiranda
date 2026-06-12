import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Scissors, Clock, CalendarDays, Users, LogOut, Menu, X, Download } from 'lucide-react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
  }

  const handleLogout = () => { logout(); navigate('/admin') }
  const closesidebar = () => setSidebarOpen(false)

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <Scissors size={20} strokeWidth={1.25} className="text-primary" />
        <div>
          <p className="text-sm font-light tracking-wide text-foreground italic">Studio Clau</p>
          <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closesidebar}
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
        {installPrompt && (
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 text-xs transition-colors text-primary hover:text-primary/80 mb-3"
          >
            <Download size={13} strokeWidth={1.5} />
            Instalar app
          </button>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs transition-colors text-muted-foreground hover:text-red-500"
        >
          <LogOut size={13} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Desktop sidebar ── */}
      <aside className="w-56 bg-card border-r border-border flex-col fixed top-0 left-0 h-full z-40 hidden md:flex">
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closesidebar}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={closesidebar}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 md:ml-56 min-h-screen flex flex-col">

        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-card border-b border-border md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Scissors size={16} strokeWidth={1.25} className="text-primary" />
            <span className="text-sm font-light tracking-wide italic text-foreground">Studio Clau</span>
          </div>
        </div>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
