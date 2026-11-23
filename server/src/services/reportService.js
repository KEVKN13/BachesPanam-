const Report = require('../models/Report')
const { GRAVEDADES, ESTADOS } = require('../config/constants')
const ApiError = require('../utils/apiError')
const { parseNumber, validateCoordinates, parseRadius } = require('../utils/validators')
const { isConfigured: cloudinaryConfigured, uploadBuffer } = require('./cloudinaryService')

function normalizeText(value, label, { required = false, min = 1, max = 1000 } = {}) {
  if (value === undefined || value === null) {
    if (required) throw ApiError.badRequest(`${label} es obligatoria`)
    return ''
  }

  const text = String(value).trim()
  if (required && text.length < min) {
    throw ApiError.badRequest(`${label} debe tener al menos ${min} caracteres`)
  }
  if (text.length > max) {
    throw ApiError.badRequest(`${label} no puede superar los ${max} caracteres`)
  }

  return text
}

async function getReportById(id) {
  const report = await Report.findById(id).populate('creadoPor', 'nombre email')

  if (!report) {
    throw ApiError.notFound('No se encontró el reporte')
  }

  return report
}

async function listReports(query = {}) {
  const filter = {}
  const hasLat = query.lat !== undefined && query.lat !== null && query.lat !== ''
  const hasLng = query.lng !== undefined && query.lng !== null && query.lng !== ''

  if (hasLat !== hasLng) {
    throw ApiError.badRequest('Debes enviar latitud y longitud juntas')
  }

  if (query.radius && !hasLat) {
    throw ApiError.badRequest('El radio requiere latitud y longitud')
  }

  if (hasLat) {
    const lat = parseNumber(query.lat, 'La latitud')
    const lng = parseNumber(query.lng, 'La longitud')
    validateCoordinates(lat, lng)

    const radius = parseRadius(query.radius)
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius * 1000,
      },
    }
  }

  if (query.gravedad) {
    if (!GRAVEDADES.includes(query.gravedad)) {
      throw ApiError.badRequest('La gravedad no es válida')
    }
    filter.gravedad = query.gravedad
  }

  if (query.estado) {
    if (!ESTADOS.includes(query.estado)) {
      throw ApiError.badRequest('El estado no es válido')
    }
    filter.estado = query.estado
  }

  let queryBuilder = Report.find(filter).populate('creadoPor', 'nombre email')

  if (!hasLat) {
    queryBuilder = queryBuilder.sort({ createdAt: -1 })
  }

  return queryBuilder.limit(500)
}

async function createReport(body = {}, file, user) {
  const lat = parseNumber(body.lat, 'La latitud')
  const lng = parseNumber(body.lng, 'La longitud')
  validateCoordinates(lat, lng)

  const descripcion = normalizeText(body.descripcion, 'La descripción', {
    required: true,
    min: 10,
    max: 1000,
  })

  const titulo = normalizeText(body.titulo, 'El título', { max: 120 }) || 'Bache reportado'

  if (!GRAVEDADES.includes(body.gravedad)) {
    throw ApiError.badRequest('La gravedad debe ser bajo, medio o alto')
  }

  let fotoUrl = null
  if (file?.buffer && cloudinaryConfigured()) {
    try {
      const uploaded = await uploadBuffer(file.buffer)
      fotoUrl = uploaded.secure_url
    } catch (error) {
      console.error('[CLOUDINARY] No se pudo subir la foto:', error.message)
      throw ApiError.unavailable('No se pudo subir la foto. Intenta de nuevo.')
    }
  } else if (file?.filename) {
    fotoUrl = `/uploads/${file.filename}`
  }

  const report = await Report.create({
    titulo,
    descripcion,
    gravedad: body.gravedad,
    location: { type: 'Point', coordinates: [lng, lat] },
    fotoUrl,
    estado: 'Reportado',
    votos: [],
    historialEstados: [
      {
        estado: 'Reportado',
        fecha: new Date(),
        cambiadoPor: user._id,
      },
    ],
    creadoPor: user._id,
  })

  return getReportById(report._id)
}

async function voteReport(id, user) {
  await getReportById(id)

  const result = await Report.updateOne(
    { _id: id, votos: { $ne: user._id } },
    { $addToSet: { votos: user._id } },
  )

  if (result.modifiedCount === 0) {
    throw ApiError.conflict('Ya votaste este bache')
  }

  return getReportById(id)
}

async function updateStatus(id, estado, user) {
  if (!ESTADOS.includes(estado)) {
    throw ApiError.badRequest('El estado debe ser Reportado, En revisión o Reparado')
  }

  const current = await getReportById(id)
  if (current.estado === estado) {
    return current
  }

  await Report.updateOne(
    { _id: id },
    {
      $set: { estado },
      $push: {
        historialEstados: {
          estado,
          fecha: new Date(),
          cambiadoPor: user._id,
        },
      },
    },
  )

  return getReportById(id)
}

module.exports = { listReports, getReportById, createReport, voteReport, updateStatus }
