const express = require('express')
const cors = require('cors')
const env = require('./config/env')
const routes = require('./routes')
const ApiError = require('./utils/apiError')
const { notFound, errorHandler } = require('./middlewares/error')

const app = express()

const allowedOrigins = env.clientUrl
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      callback(ApiError.forbidden('Origen no permitido por CORS'))
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(env.uploadDir))

app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'API Reporte de Baches · Panamá',
    basePath: '/api',
  })
})

app.use('/api', routes)
app.use(notFound)
app.use(errorHandler)

module.exports = app
