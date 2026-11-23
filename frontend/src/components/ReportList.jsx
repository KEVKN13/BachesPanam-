import { useMemo } from 'react'
import {
  ESTADOS,
  GRAVEDADES,
  estadoClass,
  formatDate,
  gravedadLabel,
  priorityLevel,
  relativeTime,
  truncate,
} from '../utils/format'

const PRIORITY_LABELS = {
  urgente: 'Urgente',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export default function ReportList({
  reports,
  loading,
  error,
  selectedId,
  onSelect,
  filters,
  onFiltersChange,
  onRetry,
}) {
  const visibleReports = useMemo(() => {
    const items = [...reports]

    const filtered = items.filter((report) => {
      const matchesGravedad = !filters.gravedad || report.gravedad === filters.gravedad
      const matchesEstado = !filters.estado || report.estado === filters.estado
      return matchesGravedad && matchesEstado
    })

    if (filters.sort === 'recientes') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else {
      filtered.sort((a, b) => (b.votosCount || 0) - (a.votosCount || 0))
    }

    return filtered
  }, [reports, filters])

  const maxVotos = useMemo(
    () => visibleReports.reduce((max, report) => Math.max(max, report.votosCount || 0), 1),
    [visibleReports],
  )

  const setFilter = (key, value) => onFiltersChange({ ...filters, [key]: value })

  return (
    <section className="reports-section" aria-label="Lista de baches">
      <div className="reports-section__head">
        <h2>Baches reportados</h2>
        <span className="count-pill">{visibleReports.length}</span>
      </div>

      <div className="filters">
        <select
          aria-label="Filtrar por gravedad"
          value={filters.gravedad}
          onChange={(event) => setFilter('gravedad', event.target.value)}
        >
          <option value="">Todas las gravedades</option>
          {GRAVEDADES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Filtrar por estado"
          value={filters.estado}
          onChange={(event) => setFilter('estado', event.target.value)}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>

        <select
          aria-label="Ordenar reportes"
          value={filters.sort}
          onChange={(event) => setFilter('sort', event.target.value)}
        >
          <option value="votos">Más votados</option>
          <option value="recientes">Más recientes</option>
        </select>
      </div>

      {loading && <p className="state-message">Cargando reportes…</p>}

      {!loading && error && (
        <div className="alert alert--error">
          <span>{error}</span>
          <button type="button" onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && visibleReports.length === 0 && (
        <p className="state-message">
          No hay baches con estos filtros. ¡Sé el primero en reportar uno!
        </p>
      )}

      <ul className="reports-list">
        {visibleReports.map((report) => {
          const priority = priorityLevel(report)
          const currentStep = ESTADOS.indexOf(report.estado)

          return (
          <li key={report.id}>
            <button
              type="button"
              className={`report-item${selectedId === report.id ? ' is-selected' : ''}`}
              onClick={() => onSelect(report.id)}
              aria-pressed={selectedId === report.id}
            >
              <div className="report-item__top">
                <span className={`severity-dot severity-dot--${report.gravedad}`} />
                <strong>{truncate(report.titulo, 48)}</strong>
                {report.fotoUrl && <span title="Tiene foto">📷</span>}
                <span className="vote-pill" title="Votos">
                  ▲ {report.votosCount || 0}
                </span>
              </div>

              <p>{truncate(report.descripcion, 90)}</p>

              <div className="report-item__votes" aria-hidden="true">
                <span
                  className="report-item__votes-fill"
                  style={{ width: `${Math.round(((report.votosCount || 0) / maxVotos) * 100)}%` }}
                />
              </div>

              <div className="report-item__meta">
                <span className={`status-badge status-badge--${estadoClass(report.estado)}`}>
                  {report.estado}
                </span>
                <span className={`priority-badge priority-badge--${priority}`}>
                  {PRIORITY_LABELS[priority]}
                </span>
                <span>{gravedadLabel(report.gravedad)}</span>
                <span title={formatDate(report.createdAt)}>{relativeTime(report.createdAt)}</span>
              </div>

              <div className="report-timeline" aria-label="Historial de estados">
                {ESTADOS.map((estado, index) => (
                  <span
                    key={estado}
                    className={`report-timeline__step${index < currentStep ? ' is-done' : ''}${index === currentStep ? ' is-current' : ''}`}
                    title={estado}
                  />
                ))}
              </div>
            </button>
          </li>
          )
        })}
      </ul>
    </section>
  )
}
