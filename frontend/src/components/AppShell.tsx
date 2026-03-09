import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function NavItem({
  to,
  children,
}: {
  to: string
  children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'text-sm font-medium px-3 py-2 rounded-md transition',
          isActive
            ? 'text-gray-900 bg-gray-100'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                CR
              </div>
              <span className="font-semibold text-gray-900">CryptoRisk</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavItem to="/">Home</NavItem>
              {token && <NavItem to="/profile">Dashboard</NavItem>}
              {token && <NavItem to="/calculate-metrics">Metrics</NavItem>}
            </nav>

            <div className="flex items-center gap-3">
              {token ? (
                <button
                  onClick={logout}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-md transition shadow-sm"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}

