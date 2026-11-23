const express = require('express')
const adminController = require('../controllers/adminController')
const { protect, staffOnly } = require('../middlewares/auth')

const router = express.Router()

router.get('/stats', protect, staffOnly, adminController.getStats)

module.exports = router
