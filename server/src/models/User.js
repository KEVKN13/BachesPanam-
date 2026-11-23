const mongoose = require('mongoose')
const { ROLES } = require('../config/constants')

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [80, 'El nombre es demasiado largo'],
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'El correo no es válido'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    rol: {
      type: String,
      enum: ROLES,
      default: 'ciudadano',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCodeHash: {
      type: String,
      select: false,
    },
    verificationExpiresAt: {
      type: Date,
      select: false,
    },
    verificationAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    verificationSentAt: {
      type: Date,
      select: false,
    },
    resetCodeHash: {
      type: String,
      select: false,
    },
    resetExpiresAt: {
      type: Date,
      select: false,
    },
    resetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    resetSentAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = doc._id.toString()
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
        return ret
      },
    },
  },
)

module.exports = mongoose.model('User', userSchema)
