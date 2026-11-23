import { useState } from 'react'
import { photoUrl } from '../api/client'
import {
  ESTADOS,
  estadoClass,
  formatDate,
  gravedadLabel,
  hasVoted,
} from '../utils/format'

export default function ReportDetail({
  report,
  user,
  isAdmin,
  onClose,
  onVote,
  onStatusChange,
  onRequireAuth,
}) {
  const [estado, setEstado] = useState(report.estado)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const votos = report.votosCount ?? report.votos?.length ?? 0
  const alreadyVoted = hasVoted(report, user)

  const handleVote = async () => {
    setError('')
    setBusy(true)
    try {
      await onVote(report.id)
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'No se pudo registrar el voto')
    } finally {
      setBusy(false)
    }
  }

  const handleStatus = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onStatusChange(report.id, estado)
    } catch (err) {
      setError(err?.response?.data?.error?.message || 'No se pudo cambiar el estado')
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside className="detail-panel" aria-label="Detalle del bache">
      <button type="button" className="modal__close" onClick={onClose} aria-label="Cerrar">
        ×
      </button>

        {report.fotoUrl && (
          <img
            className="detail-photo"
            src={photoUrl(report.fotoUrl)}
            alt={`Foto del reporte ${report.titulo}`}
          />
        )}

        <div className="detail-header">
          <h2>{report.titulo}</h2>
          <span className={`status-badge status-badge--${estadoClass(report.estado)}`}>
            {report.estado}
          </span>
        </div>

        <p className="detail-description">{report.descripcion}</p>

        <dl className="detail-grid">
          <div>
            <dt>Gravedad</dt>
            <dd>{gravedadLabel(report.gravedad)}</dd>
          </div>
          <div>
            <dt>Votos</dt>
            <dd>{votos}</dd>
          </div>
          <div>
            <dt>Reportado por</dt>
            <dd>{report.creadoPor?.nombre || 'Ciudadano'}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{formatDate(report.createdAt)}</dd>
          </div>
          <div>
            <dt>Ubicación</dt>
            <dd>
              {Number(report.lat).toFixed(5)}, {Number(report.lng).toFixed(5)}
            </dd>
          </div>
        </dl>

        <div className="detail-actions">
          {user ? (
            <button
              type="button"
              className="button button--primary"
              onClick={handleVote}
              disabled={busy || alreadyVoted}
            >
              {alreadyVoted ? 'Ya votaste este bache' : 'Votar este bache'}
            </button>
          ) : (
            <button type="button" className="button button--primary" onClick={onRequireAuth}>
              Inicia sesión para votar
            </button>
          )}

          {isAdmin && (
            <form className="status-form" onSubmit={handleStatus}>
              <select value={estado} onChange={(event) => setEstado(event.target.value)}>
                {ESTADOS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <button type="submit" className="button button--dark" disabled={busy}>
                Actualizar
              </button>
            </form>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <section className="history">
          <h3>Historial de estados</h3>
          <ol>
            {(report.historialEstados || []).map((item, index) => (
              <li key={`${item.fecha}-${index}`}>
                <span className={`history-dot history-dot--${estadoClass(item.estado)}`} />
                <div>
                  <strong>{item.estado}</strong>
                  <span>{formatDate(item.fecha)}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
    </aside>
  )
}
