const mongoose = require('mongoose')
const { GRAVEDADES, ESTADOS } = require('../config/constants')

const reportSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      trim: true,
      maxlength: [120, 'El título es demasiado largo'],
      default: 'Bache reportado',
    },
    descripcion: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
      maxlength: [1000, 'La descripción es demasiado larga'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number],
        required: [true, 'La ubicación es obligatoria'],
        validate: {
          validator: (coords) =>
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords.every((value) => Number.isFinite(value)),
          message: 'Las coordenadas no son válidas',
        },
      },
    },
    gravedad: {
      type: String,
      enum: GRAVEDADES,
      required: true,
      default: 'medio',
    },
    fotoUrl: {
      type: String,
      default: null,
    },
    estado: {
      type: String,
      enum: ESTADOS,
      default: 'Reportado',
    },
    votos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    historialEstados: [
      {
        estado: {
          type: String,
          enum: ESTADOS,
          required: true,
        },
        fecha: {
          type: Date,
          default: Date.now,
        },
        cambiadoPor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          default: null,
        },
      },
    ],
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        ret.id = doc._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  },
)

reportSchema.index({ location: '2dsphere' })

reportSchema.virtual('lat').get(function lat() {
  return this.location?.coordinates?.[1]
})

reportSchema.virtual('lng').get(function lng() {
  return this.location?.coordinates?.[0]
})

reportSchema.virtual('votosCount').get(function votosCount() {
  return this.votos?.length || 0
})

module.exports = mongoose.model('Report', reportSchema)
