const jwt = require('jsonwebtoken')
const env = require('../config/env')
const User = require('../models/User')
const ApiError = require('../utils/apiError')
const asyncHandler = require('../utils/asyncHandler')

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Debes iniciar sesión para realizar esta acción')
  }

  let payload
  try {
    payload = jwt.verify(token, env.jwtSecret)
  } catch {
    throw ApiError.unauthorized('El token es inválido o ha expirado')
  }

  const user = await User.findById(payload.id).select('-passwordHash')
  if (!user) {
    throw ApiError.unauthorized('El usuario de este token ya no existe')
  }

  req.user = user
  next()
})

const requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.rol)) {
    return next(ApiError.forbidden('No tienes permisos para esta acción'))
  }

  next()
}

const adminOnly = requireRoles('admin')
const staffOnly = requireRoles('admin', 'moderador')

module.exports = { protect, adminOnly, staffOnly, requireRoles }
