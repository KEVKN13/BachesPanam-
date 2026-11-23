const express = require('express')
const authController = require('../controllers/authController')
const { protect } = require('../middlewares/auth')

const router = express.Router()

router.post('/register', authController.register)
router.post('/verify', authController.verify)
router.post('/resend-code', authController.resendCode)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password', authController.resetPassword)
router.post('/login', authController.login)
router.get('/me', protect, authController.me)

module.exports = router
