export const GRAVEDADES = [
  { value: 'bajo', label: 'Bajo' },
  { value: 'medio', label: 'Medio' },
  { value: 'alto', label: 'Alto' },
]

export const ESTADOS = ['Reportado', 'En revisión', 'Reparado']

const GRAVEDAD_LABELS = {
  bajo: 'Bajo',
  medio: 'Medio',
  alto: 'Alto',
}

export function gravedadLabel(value) {
  return GRAVEDAD_LABELS[value] || value || 'Sin definir'
}

export function estadoClass(estado) {
  return (
    {
      Reportado: 'reportado',
      'En revisión': 'revision',
      Reparado: 'reparado',
    }[estado] || 'reportado'
  )
}

export function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function relativeTime(value) {
  if (!value) return ''
  const elapsed = Date.now() - new Date(value).getTime()
  const minutes = Math.floor(elapsed / 60000)

  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`

  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`

  return formatDate(value)
}

export function priorityLevel(report) {
  const weight = { bajo: 1, medio: 2, alto: 3 }[report?.gravedad] || 1
  const score = weight * 10 + (report?.votosCount || 0) * 2

  if (score >= 50) return 'urgente'
  if (score >= 30) return 'alta'
  if (score >= 18) return 'media'
  return 'baja'
}

export function truncate(text, max = 100) {
  const value = text || ''
  return value.length > max ? `${value.slice(0, max).trim()}…` : value
}

export function hasVoted(report, user) {
  if (!report?.votos || !user?.id) return false
  return report.votos.some((vote) => {
    const id = typeof vote === 'string' ? vote : vote.id || vote._id
    return id === user.id
  })
}
