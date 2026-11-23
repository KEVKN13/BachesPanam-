import { useEffect, useState } from 'react'
import { api, getErrorMessage } from '../api/client'

function StatCard({ label, value, tone = 'primary' }) {
  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  )
}

function BarChart({ title, data, color = 'var(--primary)' }) {
  const max = Math.max(1, ...data.map((item) => item.total))

  return (
    <section className="chart-card">
      <div className="chart-card__head">
        <h3>{title}</h3>
      </div>
      <div className="bar-chart">
        {data.map((item) => (
          <div key={item.label} className="bar-chart__col" title={`${item.label}: ${item.total}`}>
            <span className="bar-chart__value">{item.total}</span>
            <div className="bar-chart__track">
              <div
                className="bar-chart__fill"
                style={{ height: `${(item.total / max) * 100}%`, background: color }}
              />
            </div>
            <span className="bar-chart__label">{item.label.slice(5)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Breakdown({ title, data }) {
  const total = data.reduce((sum, item) => sum + item.total, 0) || 1

  return (
    <section className="chart-card">
      <div className="chart-card__head">
        <h3>{title}</h3>
      </div>
      <div className="breakdown">
        {data.map((item) => (
          <div key={item.label} className="breakdown__row">
            <div className="breakdown__meta">
              <span>{item.label}</span>
              <span>{item.total}</span>
            </div>
            <div className="breakdown__track">
              <div
                className="breakdown__fill"
                style={{ width: `${(item.total / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true

    async function load() {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/admin/stats')
        if (alive) setStats(data.data)
      } catch (err) {
        if (alive) setError(getErrorMessage(err, 'No se pudo cargar el panel'))
      } finally {
        if (alive) setLoading(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [])

  return (
    <main className="admin-page">
      <div className="admin-page__head">
        <div>
          <span className="home__eyebrow">Administración</span>
          <h2>Panel de actividad</h2>
          <p>Resumen operativo de reportes y usuarios en Changuinola.</p>
        </div>
      </div>

      {loading && <p className="state-message">Cargando estadísticas…</p>}
      {error && <p className="alert alert--error">{error}</p>}

      {stats && (
        <>
          <section className="stats-grid">
            <StatCard label="Reportes totales" value={stats.totals.reports} />
            <StatCard label="Pendientes" value={stats.totals.pending} tone="warning" />
            <StatCard label="Reparados" value={stats.totals.repaired} tone="success" />
            <StatCard label="Usuarios" value={stats.totals.users} tone="info" />
          </section>

          <div className="charts-grid">
            <BarChart title="Reportes por día (14 días)" data={stats.reportsPerDay} />
            <BarChart
              title="Usuarios registrados por día (14 días)"
              data={stats.usersPerDay}
              color="var(--info-text)"
            />
            <BarChart
              title="Baches reparados por semana"
              data={stats.repairedPerWeek}
              color="var(--success)"
            />
            <Breakdown title="Por estado" data={stats.byStatus} />
            <Breakdown title="Por gravedad" data={stats.bySeverity} />
          </div>
        </>
      )}
    </main>
  )
}
