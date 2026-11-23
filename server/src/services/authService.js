const crypto = require('node:crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const env = require('../config/env')
const ApiError = require('../utils/apiError')
const { sendVerificationCode, sendWelcomeEmail, sendPasswordResetCode } = require('./mailService')

const SALT_ROUNDS = 10
const MAX_CODE_ATTEMPTS = 5
const VERIFY_FIELDS =
  '+verificationCodeHash +verificationExpiresAt +verificationAttempts +verificationSentAt'
const RESET_FIELDS = '+resetCodeHash +resetExpiresAt +resetAttempts +resetSentAt'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), rol: user.rol },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  )
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    isVerified: Boolean(user.isVerified),
  }
}

async function issueVerificationCode(user) {
  const lastSent = user.verificationSentAt ? new Date(user.verificationSentAt).getTime() : 0

  if (Date.now() - lastSent < env.otpResendSeconds * 1000) {
    throw ApiError.badRequest(`Espera ${env.otpResendSeconds} s para pedir otro código`)
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  user.verificationCodeHash = await bcrypt.hash(code, SALT_ROUNDS)
  user.verificationExpiresAt = new Date(Date.now() + env.otpMinutes * 60000)
  user.verificationAttempts = 0
  user.verificationSentAt = new Date()
  await user.save()

  try {
    await sendVerificationCode(user.email, code)
  } catch (error) {
    console.error('[MAIL] No se pudo enviar el código:', error.message)
    throw ApiError.unavailable('No se pudo enviar el código. Intenta de nuevo.')
  }
}

async function register({ nombre, email, password }) {
  if (typeof password !== 'string' || password.length < 6) {
    throw ApiError.badRequest('La contraseña debe tener al menos 6 caracteres')
  }

  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    throw ApiError.badRequest('El correo es obligatorio')
  }

  let user = await User.findOne({ email: normalizedEmail }).select(VERIFY_FIELDS)

  if (user?.isVerified) {
    throw ApiError.conflict('Ya existe un usuario con ese correo')
  }

  if (!user) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    user = await User.create({
      nombre,
      email: normalizedEmail,
      passwordHash,
      isVerified: false,
    })
  }

  await issueVerificationCode(user)

  return {
    pending: true,
    email: normalizedEmail,
    message: 'Enviamos un código de verificación a tu correo',
  }
}

async function verifyRegistration({ email, code }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select(VERIFY_FIELDS)

  if (!user) {
    throw ApiError.badRequest('No encontramos esa solicitud de registro')
  }

  if (user.isVerified) {
    return { token: signToken(user), user: publicUser(user) }
  }

  if (!user.verificationCodeHash || !user.verificationExpiresAt) {
    throw ApiError.badRequest('Solicita un código de verificación')
  }

  if (new Date(user.verificationExpiresAt) < new Date()) {
    throw ApiError.badRequest('El código expiró. Solicita uno nuevo.')
  }

  if (user.verificationAttempts >= MAX_CODE_ATTEMPTS) {
    throw ApiError.badRequest('Demasiados intentos. Solicita un código nuevo.')
  }

  const isValid = await bcrypt.compare(String(code || ''), user.verificationCodeHash)

  if (!isValid) {
    user.verificationAttempts += 1
    await user.save()
    throw ApiError.badRequest('Código incorrecto')
  }

  await User.updateOne(
    { _id: user._id },
    {
      $set: { isVerified: true, verificationAttempts: 0 },
      $unset: {
        verificationCodeHash: 1,
        verificationExpiresAt: 1,
        verificationSentAt: 1,
      },
    },
  )

  const verified = await User.findById(user._id)

  sendWelcomeEmail(verified.email, verified.nombre).catch((error) => {
    console.error('[MAIL] No se pudo enviar bienvenida:', error.message)
  })

  return { token: signToken(verified), user: publicUser(verified) }
}

async function resendCode({ email }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select(VERIFY_FIELDS)

  if (!user) {
    throw ApiError.badRequest('No encontramos esa solicitud de registro')
  }

  if (user.isVerified) {
    throw ApiError.badRequest('Esta cuenta ya está verificada')
  }

  await issueVerificationCode(user)
  return { ok: true, message: 'Código reenviado' }
}

async function forgotPassword({ email }) {
  const normalizedEmail = normalizeEmail(email)
  const user = await User.findOne({ email: normalizedEmail }).select(RESET_FIELDS)

  if (!user) {
    return { ok: true, message: 'Si el correo está registrado, enviaremos un código de recuperación' }
  }

  const lastSent = user.resetSentAt ? new Date(user.resetSentAt).getTime() : 0
  if (Date.now() - lastSent < env.otpResendSeconds * 1000) {
    throw ApiError.badRequest(`Espera ${env.otpResendSeconds} s para pedir otro código`)
  }

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0')
  user.resetCodeHash = await bcrypt.hash(code, SALT_ROUNDS)
  user.resetExpiresAt = new Date(Date.now() + env.otpMinutes * 60000)
  user.resetAttempts = 0
  user.resetSentAt = new Date()
  await user.save()

  try {
    await sendPasswordResetCode(normalizedEmail, code)
  } catch (error) {
    console.error('[MAIL] No se pudo enviar código de recuperación:', error.message)
    throw ApiError.unavailable('No se pudo enviar el código. Intenta de nuevo.')
  }

  return { ok: true, message: 'Si el correo está registrado, enviaremos un código de recuperación' }
}

async function resetPassword({ email, code, password }) {
  if (typeof password !== 'string' || password.length < 6) {
    throw ApiError.badRequest('La contraseña debe tener al menos 6 caracteres')
  }

  const user = await User.findOne({ email: normalizeEmail(email) }).select(
    `${RESET_FIELDS} +passwordHash`,
  )

  if (!user || !user.resetCodeHash || !user.resetExpiresAt) {
    throw ApiError.badRequest('Solicita un código de recuperación primero')
  }

  if (new Date(user.resetExpiresAt) < new Date()) {
    throw ApiError.badRequest('El código expiró. Solicita uno nuevo.')
  }

  if (user.resetAttempts >= MAX_CODE_ATTEMPTS) {
    throw ApiError.badRequest('Demasiados intentos. Solicita un código nuevo.')
  }

  const isValid = await bcrypt.compare(String(code || ''), user.resetCodeHash)
  if (!isValid) {
    user.resetAttempts += 1
    await user.save()
    throw ApiError.badRequest('Código incorrecto')
  }

  user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  user.resetCodeHash = undefined
  user.resetExpiresAt = undefined
  user.resetAttempts = 0
  user.resetSentAt = undefined
  user.isVerified = true
  await user.save()

  return { ok: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' }
}

async function login({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select('+passwordHash')

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    throw ApiError.unauthorized('Correo o contraseña incorrectos')
  }

  if (user.isVerified === false) {
    throw ApiError.forbidden('Verifica tu correo antes de ingresar')
  }

  return { token: signToken(user), user: publicUser(user) }
}

module.exports = {
  register,
  verifyRegistration,
  resendCode,
  forgotPassword,
  resetPassword,
  login,
  publicUser,
}
