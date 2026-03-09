import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_PROFILES, GET_METRICS } from '../lib/graphql'
import { DashboardShell } from '../components/DashboardShell'
import { Button, Card, Input, Label } from '../components/ui'

const METRICS_PAGE_SIZE = 16

type MetricLevel = 'low' | 'medium' | 'high'

type MetricItem = {
  contractAddress?: string | null
  contractName?: string | null
  logoURL?: string | null
  totalBalance?: number | null
  balanceVolatility?: number | null
  downsideVolatility?: number | null
  maxDrawdown?: number | null
  drawDownVolatility?: number | null
  giniCoefficientOfBalances?: number | null
}

type ProfileResponseItem = {
  profileType: string
  entityRef: string
  network: string
  metrics?: MetricItem[]
}

/** Classify a metric value as low / medium / high for risk interpretation. */
function getMetricLevel(
  key: keyof MetricItem,
  value: number
): MetricLevel {
  switch (key) {
    case 'balanceVolatility':
    case 'downsideVolatility':
    case 'drawDownVolatility':
      if (value < 0.1) return 'low'
      if (value < 0.25) return 'medium'
      return 'high'
    case 'maxDrawdown':
      if (value < 0.1) return 'low'
      if (value < 0.25) return 'medium'
      return 'high'
    case 'giniCoefficientOfBalances':
      if (value < 0.33) return 'low'
      if (value < 0.66) return 'medium'
      return 'high'
    default:
      return 'medium'
  }
}

const METRIC_CONFIG: Record<
  keyof Omit<MetricItem, 'contractAddress' | 'contractName' | 'logoURL'>,
  { label: string; description: string; format: (v: number) => string; hasLevel: boolean }
> = {
  totalBalance: {
    label: 'Total balance',
    description:
      'Total balance value (e.g. in quote currency) over the analysis period. Represents the magnitude of exposure.',
    format: (v) =>
      v.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 0 }),
    hasLevel: false,
  },
  balanceVolatility: {
    label: 'Balance volatility',
    description:
      'Standard deviation of balance changes over time. Higher values mean the balance fluctuates more; low is stable, high is risky.',
    format: (v) => v.toFixed(4),
    hasLevel: true,
  },
  downsideVolatility: {
    label: 'Downside volatility',
    description:
      'Volatility of negative returns only. Measures the variability of losses; higher means riskier downside.',
    format: (v) => v.toFixed(4),
    hasLevel: true,
  },
  maxDrawdown: {
    label: 'Max drawdown',
    description:
      'Largest peak-to-trough decline in balance over the period. Shows the worst loss from a previous high; higher is worse.',
    format: (v) => v.toFixed(4),
    hasLevel: true,
  },
  drawDownVolatility: {
    label: 'Drawdown volatility',
    description:
      'Variability of drawdowns over time. Indicates how stable or erratic the drawdowns are.',
    format: (v) => v.toFixed(4),
    hasLevel: true,
  },
  giniCoefficientOfBalances: {
    label: 'Gini coefficient',
    description:
      'Measures inequality of balance across the period. 0 = evenly spread; 1 = concentrated in a short time.',
    format: (v) => v.toFixed(4),
    hasLevel: true,
  },
}

function LevelBar({ level }: { level: MetricLevel }) {
  const segments: { level: MetricLevel; label: string; color: string }[] = [
    { level: 'low', label: 'Low', color: 'bg-emerald-500' },
    { level: 'medium', label: 'Medium', color: 'bg-amber-500' },
    { level: 'high', label: 'High', color: 'bg-red-500' },
  ]
  const activeIndex = segments.findIndex((s) => s.level === level)

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 h-2.5 rounded-full overflow-hidden bg-gray-200 border border-gray-200">
        {segments.map((seg, i) => (
          <div
            key={seg.level}
            className={`h-full flex-1 transition-all duration-500 ease-out ${
              i <= activeIndex ? seg.color : 'bg-gray-100'
            } ${i === activeIndex ? 'animate-level-bar' : ''}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold text-gray-700 capitalize w-14 shrink-0">
        {level}
      </span>
    </div>
  )
}

function MetricDetailModal({
  profile,
  metric,
  onClose,
}: {
  profile: ProfileResponseItem
  metric: MetricItem
  onClose: () => void
}) {
  const entries = (
    [
      'totalBalance',
      'balanceVolatility',
      'downsideVolatility',
      'maxDrawdown',
      'drawDownVolatility',
      'giniCoefficientOfBalances',
    ] as const
  ).filter((key) => metric[key] != null)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Metric details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={metric.logoURL || '/default-token.svg'}
              alt={metric.contractName || 'Token'}
              className="h-12 w-12 rounded-full object-cover shrink-0 bg-gray-100"
              onError={(e) => {
                const t = e.currentTarget
                if (t.src !== '/default-token.svg') t.src = '/default-token.svg'
              }}
            />
            <div className="min-w-0">
              <p className="font-mono text-sm font-semibold text-gray-900 break-all">
                {metric.contractAddress || metric.contractName || 'Contract'}
              </p>
              {metric.contractName && (
                <p className="text-xs text-gray-500 truncate">{metric.contractName}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {profile.profileType} · {profile.network}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {entries.map((key) => {
              const value = metric[key] as number
              const config = METRIC_CONFIG[key]
              const level = config.hasLevel ? getMetricLevel(key, value) : null
              return (
                <div key={key} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{config.label}</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {config.format(value)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                  {config.hasLevel && level && (
                    <LevelBar level={level} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function CalculateMetricsPage() {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [window, setWindow] = useState(30)
  const [showResults, setShowResults] = useState(false)
  const [metricsPage, setMetricsPage] = useState(0)
  const [detailMetric, setDetailMetric] = useState<{
    profile: ProfileResponseItem
    metric: MetricItem
  } | null>(null)

  const { data: profilesData, loading: profilesLoading } = useQuery(GET_PROFILES)

  const { data: metricsData, loading: metricsLoading, refetch } = useQuery(
    GET_METRICS,
    {
      skip: !showResults,
      variables: {
        profile: selectedProfiles.map((index) => {
          const profile = profilesData?.profiles[parseInt(index)]
          return {
            profileType: profile.profileType,
            entityRef: profile.entityRef,
            network: profile.network,
          }
        }),
        window,
      },
    }
  )

  const handleProfileToggle = (index: string) => {
    setSelectedProfiles((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
    setShowResults(false)
  }

  const handleCalculate = () => {
    if (selectedProfiles.length === 0) {
      alert('Please select at least one profile')
      return
    }
    setMetricsPage(0)
    setShowResults(true)
    refetch()
  }

  const profileResponses = (metricsData?.metrics ?? []) as ProfileResponseItem[]
  const flattenedMetrics = profileResponses.flatMap((pr) =>
    (pr.metrics ?? []).map((metric) => ({ profile: pr, metric }))
  )
  const totalMetrics = flattenedMetrics.length
  const totalPages = Math.max(1, Math.ceil(totalMetrics / METRICS_PAGE_SIZE))
  const currentPage = Math.min(metricsPage, totalPages - 1)
  const paginatedMetrics = flattenedMetrics.slice(
    currentPage * METRICS_PAGE_SIZE,
    (currentPage + 1) * METRICS_PAGE_SIZE
  )
  const startItem = currentPage * METRICS_PAGE_SIZE + 1
  const endItem = Math.min((currentPage + 1) * METRICS_PAGE_SIZE, totalMetrics)

  return (
    <DashboardShell
      title="Calculate metrics"
      subtitle="Select profiles and compute risk metrics over a time window."
    >
      <Card className="p-5 mb-6">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <Label htmlFor="window">Time window (days)</Label>
            <div className="mt-2">
              <Input
                id="window"
                type="number"
                value={window}
                min={1}
                max={365}
                onChange={(e) => {
                  setWindow(parseInt(e.target.value || '0', 10))
                  setShowResults(false)
                }}
              />
            </div>
          </div>
          <div className="md:col-span-2 flex items-center justify-end">
            <Button
              onClick={handleCalculate}
              disabled={selectedProfiles.length === 0 || metricsLoading}
            >
              {metricsLoading ? 'Calculating…' : 'Calculate'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Profiles</div>
          <div className="text-xs text-gray-500">
            {selectedProfiles.length} selected
          </div>
        </div>

        {profilesLoading ? (
          <div className="px-5 py-10 text-sm text-gray-600">Loading…</div>
        ) : !profilesData?.profiles || profilesData.profiles.length === 0 ? (
          <div className="px-5 py-10 text-sm text-gray-600">
            No profiles available. Add profiles in the Dashboard first.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {profilesData.profiles.map((profile: any, index: number) => {
              const id = index.toString()
              const checked = selectedProfiles.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => handleProfileToggle(id)}
                  className={[
                    'w-full text-left px-5 py-4 flex items-start justify-between gap-4',
                    checked ? 'bg-brand-50' : 'bg-white hover:bg-gray-50',
                  ].join(' ')}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'inline-flex h-5 w-5 items-center justify-center rounded border',
                          checked
                            ? 'bg-brand-600 border-brand-600'
                            : 'bg-white border-gray-300',
                        ].join(' ')}
                      >
                        {checked ? (
                          <svg
                            className="h-3.5 w-3.5 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3.5-3.5a1 1 0 011.414-1.414l2.793 2.793 6.793-6.793a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : null}
                      </span>
                      <div className="font-semibold text-gray-900 capitalize">
                        {profile.profileType}
                      </div>
                      <div className="text-xs text-gray-500">{profile.network}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600 font-mono break-all">
                      {profile.entityRef}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-gray-600">
                    {checked ? 'Selected' : 'Select'}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Card>

      {showResults && metricsLoading ? (
        <Card className="overflow-hidden p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="h-14 w-14 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-brand-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Calculating metrics
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-sm">
              Computing volatility, drawdowns, and distribution stats. This may
              take a moment for multiple profiles.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-600 animate-loading-dot" />
              <span className="h-2 w-2 rounded-full bg-brand-500 animate-loading-dot-2" />
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-loading-dot-3" />
            </div>
          </div>
        </Card>
      ) : null}

      {showResults && !metricsLoading && metricsData?.metrics ? (
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-gray-900">Results</div>
              <div className="text-xs text-gray-500">
                Computed for {window} day window
              </div>
            </div>
            {totalMetrics > METRICS_PAGE_SIZE && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>
                  Showing {startItem}–{endItem} of {totalMetrics}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    onClick={() => setMetricsPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="!py-1.5 !px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="px-2 text-gray-500">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setMetricsPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="!py-1.5 !px-3 text-xs"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="p-5">
            <div className="grid md:grid-cols-2 gap-5">
              {paginatedMetrics.map(({ profile, metric }, index) => (
                <button
                  type="button"
                  key={`${profile.entityRef}-${metric.contractAddress ?? index}`}
                  onClick={() => setDetailMetric({ profile, metric })}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left hover:border-brand-300 hover:shadow-md transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {profile.profileType} · {profile.network}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={metric.logoURL || '/default-token.svg'}
                      alt={metric.contractName || 'Token'}
                      className="h-10 w-10 rounded-full object-cover shrink-0 bg-gray-100"
                      onError={(e) => {
                        const target = e.currentTarget
                        if (target.src !== '/default-token.svg') {
                          target.src = '/default-token.svg'
                        }
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 break-all font-mono text-sm">
                        {metric.contractAddress || metric.contractName || 'Contract'}
                      </h4>
                      {metric.contractName && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {metric.contractName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {metric.totalBalance != null && (
                      <div className="flex justify-between text-sm">
                        <span
                          className="text-gray-600 cursor-help border-b border-dotted border-gray-400"
                          title="Total balance value (e.g. in quote currency) over the analysis period."
                        >
                          Total balance
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.totalBalance.toLocaleString(undefined, {
                            maximumFractionDigits: 4,
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    )}
                    {metric.balanceVolatility != null && (
                      <div className="flex justify-between text-sm">
                        <span
                          className="text-gray-600 cursor-help border-b border-dotted border-gray-400"
                          title="Standard deviation of balance changes over time. Higher values mean the balance fluctuates more."
                        >
                          Balance volatility
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.balanceVolatility.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {metric.downsideVolatility != null && (
                      <div className="flex justify-between text-sm">
                        <span
                          className="text-gray-600 cursor-help border-b border-dotted border-gray-400"
                          title="Volatility of negative returns only. Measures the variability of losses; higher means riskier downside."
                        >
                          Downside volatility
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.downsideVolatility.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {metric.maxDrawdown != null && (
                      <div className="flex justify-between text-sm">
                        <span
                          className="text-gray-600 cursor-help border-b border-dotted border-gray-400"
                          title="Largest peak-to-trough decline in balance over the period. Shows the worst loss from a previous high."
                        >
                          Max drawdown
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.maxDrawdown.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {metric.drawDownVolatility != null && (
                      <div className="flex justify-between text-sm">
                        <span
                          className="text-gray-600 cursor-help border-b border-dotted border-gray-400"
                          title="Variability of drawdowns over time. Indicates how stable or erratic the drawdowns are."
                        >
                          Drawdown volatility
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.drawDownVolatility.toFixed(4)}
                        </span>
                      </div>
                    )}
                    {metric.giniCoefficientOfBalances != null && (
                      <div className="flex justify-between text-sm">
                        <span
                          className="text-gray-600 cursor-help border-b border-dotted border-gray-400"
                          title="Measures inequality of balance across the period. 0 = evenly spread; 1 = concentrated in a short time."
                        >
                          Gini coefficient
                        </span>
                        <span className="font-semibold text-gray-900">
                          {metric.giniCoefficientOfBalances.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {detailMetric && (
              <MetricDetailModal
                profile={detailMetric.profile}
                metric={detailMetric.metric}
                onClose={() => setDetailMetric(null)}
              />
            )}
            {totalMetrics > METRICS_PAGE_SIZE && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-gray-500">
                  Showing {startItem}–{endItem} of {totalMetrics} metrics
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setMetricsPage(0)}
                    disabled={currentPage === 0}
                    className="!py-1.5 !px-3 text-xs"
                  >
                    First
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setMetricsPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="!py-1.5 !px-3 text-xs"
                  >
                    Previous
                  </Button>
                  <span className="min-w-[6rem] text-center text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setMetricsPage((p) => Math.min(totalPages - 1, p + 1))
                    }
                    disabled={currentPage >= totalPages - 1}
                    className="!py-1.5 !px-3 text-xs"
                  >
                    Next
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setMetricsPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="!py-1.5 !px-3 text-xs"
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : null}
    </DashboardShell>
  )
}

export default CalculateMetricsPage
