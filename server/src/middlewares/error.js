const ApiError = require('../utils/apiError')

function notFound(req, res, next) {
  next(ApiError.notFound(`Ruta no encontrada: ${req.method} ${req.originalUrl}`))
}

function errorHandler(err, req, res, next) {
  let status = err.status || 500
  let message = err.message || 'Error interno del servidor'
  const details = err.details

  if (err.name === 'MulterError') {
    status = 400
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `La foto supera el tamaño máximo de ${process.env.MAX_PHOTO_SIZE_MB || 5} MB`
        : message
  } else if (err.name === 'ValidationError') {
    status = 400
    message = Object.values(err.errors).map((error) => error.message).join('; ')
  } else if (err.code === 11000) {
    status = 409
    message = 'El correo ya está registrado'
  } else if (err.name === 'CastError') {
    status = 400
    message = 'El ID proporcionado no es válido'
  }

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({
    ok: false,
    error: {
      message,
      ...(details ? { details } : {}),
    },
  })
}

module.exports = { notFound, errorHandler }
