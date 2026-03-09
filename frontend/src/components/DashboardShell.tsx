import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Container } from './ui'

function SideItem({
  to,
  label,
}: {
  to: string
  label: string
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'block rounded-md px-3 py-2 text-sm font-semibold transition',
          isActive
            ? 'bg-brand-50 text-brand-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
        ].join(' ')
      }
    >
      {label}
    </NavLink>
  )
}

export function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const { username, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <Container>
          <div className="h-16 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold">
                CR
              </div>
              <span className="font-semibold text-gray-900">CryptoRisk</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-gray-600">
                {username}
              </span>
              <button
                onClick={logout}
                className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <div className="py-8 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
          <aside className="hidden md:block">
            <div className="rounded-2xl border border-gray-200 bg-white p-3">
              <div className="px-2 py-2 text-xs font-semibold text-gray-500">
                NAVIGATION
              </div>
              <SideItem to="/profile" label="Dashboard" />
              <SideItem to="/calculate-metrics" label="Calculate metrics" />
            </div>
          </aside>

          <section>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
              ) : null}
            </div>
            {children}
          </section>
        </div>
      </Container>
    </div>
  )
}

