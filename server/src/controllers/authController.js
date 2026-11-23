const authService = require('../services/authService')
const asyncHandler = require('../utils/asyncHandler')

const register = asyncHandler(async (req, res) => {
  const { nombre, email, password } = req.body || {}
  const data = await authService.register({ nombre, email, password })

  res.status(201).json({ ok: true, data })
})

const verify = asyncHandler(async (req, res) => {
  const { email, code } = req.body || {}
  const data = await authService.verifyRegistration({ email, code })

  res.json({ ok: true, data })
})

const resendCode = asyncHandler(async (req, res) => {
  const { email } = req.body || {}
  const data = await authService.resendCode({ email })

  res.json({ ok: true, data })
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body || {}
  const data = await authService.forgotPassword({ email })

  res.json({ ok: true, data })
})

const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, password } = req.body || {}
  const data = await authService.resetPassword({ email, code, password })

  res.json({ ok: true, data })
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  const data = await authService.login({ email, password })

  res.json({ ok: true, data })
})

const me = asyncHandler(async (req, res) => {
  res.json({ ok: true, data: authService.publicUser(req.user) })
})

module.exports = { register, verify, resendCode, forgotPassword, resetPassword, login, me }
