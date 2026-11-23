const express = require('express')
const authRoutes = require('./authRoutes')
const reportRoutes = require('./reportRoutes')
const adminRoutes = require('./adminRoutes')

const router = express.Router()

router.get('/health', (req, res) => {
  res.json({ ok: true, message: 'API Reporte de Baches funcionando' })
})

router.use('/auth', authRoutes)
router.use('/reports', reportRoutes)
router.use('/admin', adminRoutes)

module.exports = router
