const env = require('../config/env')
const ApiError = require('./apiError')

function parseNumber(value, label) {
  if (value === undefined || value === null || value === '') {
    throw ApiError.badRequest(`${label} es obligatorio`)
  }

  const number = Number(value)
  if (!Number.isFinite(number)) {
    throw ApiError.badRequest(`${label} no es un número válido`)
  }

  return number
}

function validateCoordinates(lat, lng) {
  const { minLat, maxLat, minLng, maxLng } = env.bounds

  if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
    throw ApiError.badRequest(
      `La ubicación debe estar dentro de Panamá (lat ${minLat} a ${maxLat}, lng ${minLng} a ${maxLng})`,
    )
  }
}

function parseRadius(value) {
  if (value === undefined || value === null || value === '') {
    return env.defaultRadiusKm
  }

  const radius = parseNumber(value, 'El radio')
  if (radius <= 0) {
    throw ApiError.badRequest('El radio debe ser mayor a 0')
  }

  return Math.min(radius, env.maxRadiusKm)
}

module.exports = { parseNumber, validateCoordinates, parseRadius }
