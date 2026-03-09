import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AppShell } from '../components/AppShell'
import { Container, Card } from '../components/ui'

function LandingPage() {
  const { token } = useAuth()

  return (
    <AppShell>
      <div className="bg-white">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-100 blur-3xl" />
            <div className="absolute -top-24 right-[-120px] h-[360px] w-[360px] rounded-full bg-brand-50 blur-3xl" />
          </div>
          <Container>
            <div className="relative pt-14 pb-14 md:pt-20 md:pb-20">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-700">
                  <span className="h-2 w-2 rounded-full bg-brand-600" />
                  Portfolio risk metrics, simplified
                </div>
                <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight text-gray-900">
                  Understand your crypto exposure with{' '}
                  <span className="text-brand-600">institution‑style</span>{' '}
                  risk metrics.
                </h1>
                <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-2xl">
                  Add wallet profiles, compute volatility/drawdowns, and review
                  token‑level insights in a clean dashboard experience.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  {token ? (
                    <>
                      <Link
                        to="/profile"
                        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition shadow-sm"
                      >
                        Go to dashboard
                      </Link>
                      <Link
                        to="/calculate-metrics"
                        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                      >
                        Calculate metrics
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition shadow-sm"
                      >
                        Get started
                      </Link>
                      <a
                        href="#features"
                        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                      >
                        See how it works
                      </a>
                    </>
                  )}
                </div>

                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    JWT auth
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    Multi‑network profiles
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                    Token‑level metrics
                  </span>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Feature grid (Coinbase-like cards) */}
        <div id="features" className="border-t border-gray-100 bg-white">
          <Container>
            <div className="py-14 md:py-20">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  Everything you need to assess risk
                </h2>
                <p className="mt-3 text-gray-600">
                  Clean, fast workflows—add profiles, compute metrics, and
                  review results in minutes.
                </p>
              </div>

              <div className="mt-10 grid md:grid-cols-3 gap-6">
                <Card className="p-6">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <div className="h-5 w-5 rounded bg-brand-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    Volatility & drawdowns
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Balance volatility, downside volatility, max drawdown, and
                    drawdown volatility.
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <div className="h-5 w-5 rounded bg-brand-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    Distribution insights
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Gini coefficient to understand concentration and balance
                    dispersion.
                  </p>
                </Card>
                <Card className="p-6">
                  <div className="h-10 w-10 rounded-xl bg-brand-50 flex items-center justify-center">
                    <div className="h-5 w-5 rounded bg-brand-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    Profiles, not spreadsheets
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Save profiles and quickly recompute metrics over different
                    time windows.
                  </p>
                </Card>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </AppShell>
  )
}

export default LandingPage
