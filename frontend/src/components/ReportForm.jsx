import { useState } from 'react'
import { getErrorMessage } from '../api/client'
import { GRAVEDADES } from '../utils/format'

export default function ReportForm({ position, onPositionChange, onSubmit, onCancel }) {
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [gravedad, setGravedad] = useState('medio')
  const [foto, setFoto] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateCoord = (key, value) => {
    if (value === '') {
      onPositionChange({ ...(position || {}), [key]: '' })
      return
    }

    const number = Number(value)
    if (!Number.isFinite(number)) return

    onPositionChange({ ...(position || {}), [key]: number })
  }

  const useMyLocation = () => {
    setError('')

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización. Haz clic en el mapa.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onPositionChange({
          lat: Number(coords.latitude.toFixed(6)),
          lng: Number(coords.longitude.toFixed(6)),
        })
      },
      () => setError('No se pudo obtener tu ubicación. Haz clic en el mapa.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const lat = Number(position?.lat)
    const lng = Number(position?.lng)
    const hasCoords =
      position &&
      position.lat !== '' &&
      position.lng !== '' &&
      Number.isFinite(lat) &&
      Number.isFinite(lng)

    if (!hasCoords) {
      setError('Marca la ubicación haciendo clic en el mapa o usa tu ubicación actual.')
      return
    }

    const formData = new FormData()
    formData.append('titulo', titulo)
    formData.append('descripcion', descripcion)
    formData.append('gravedad', gravedad)
    formData.append('lat', String(lat))
    formData.append('lng', String(lng))
    if (foto) formData.append('foto', foto)

    setSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el reporte'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="report-form-card" aria-label="Nuevo reporte">
      <div className="card-heading">
        <h2>Reportar un bache</h2>
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Cerrar formulario">
          ×
        </button>
      </div>
      <p className="hint">Haz clic en el mapa para colocar el marcador.</p>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Título <span className="optional">(opcional)</span>
          <input
            type="text"
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            placeholder="Ej. Bache frente al mercado"
            maxLength="120"
          />
        </label>

        <label>
          Descripción
          <textarea
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Cuéntanos qué tan grande es y cómo afecta el paso"
            rows="3"
            minLength="10"
            maxLength="1000"
            required
          />
        </label>

        <label>
          Gravedad
          <select value={gravedad} onChange={(event) => setGravedad(event.target.value)}>
            {GRAVEDADES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="coord-grid">
          <label>
            Latitud
            <input
              type="number"
              step="any"
              value={position?.lat ?? ''}
              onChange={(event) => updateCoord('lat', event.target.value)}
              placeholder="9.4300"
              required
            />
          </label>
          <label>
            Longitud
            <input
              type="number"
              step="any"
              value={position?.lng ?? ''}
              onChange={(event) => updateCoord('lng', event.target.value)}
              placeholder="-82.5200"
              required
            />
          </label>
        </div>

        <button type="button" className="button button--link" onClick={useMyLocation}>
          Usar mi ubicación actual
        </button>

        <label>
          Foto <span className="optional">(opcional)</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFoto(event.target.files?.[0] || null)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="button button--primary" disabled={submitting}>
            {submitting ? 'Publicando…' : 'Publicar reporte'}
          </button>
        </div>
      </form>
    </section>
  )
}
