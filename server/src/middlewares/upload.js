const fs = require('node:fs')
const path = require('node:path')
const multer = require('multer')
const env = require('../config/env')
const ApiError = require('../utils/apiError')

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp']
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
const useCloudinary = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
)

if (!useCloudinary) {
  fs.mkdirSync(env.uploadDir, { recursive: true })
}

const diskStorage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, env.uploadDir)
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase()
    const safeExtension = allowedExtensions.includes(extension) ? extension : ''
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExtension}`
    callback(null, filename)
  },
})

const fileFilter = (req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(ApiError.badRequest('La foto debe ser JPG, PNG o WebP'))
  }

  callback(null, true)
}

const upload = multer({
  storage: useCloudinary ? multer.memoryStorage() : diskStorage,
  fileFilter,
  limits: { fileSize: env.maxPhotoSizeMb * 1024 * 1024 },
})

module.exports = upload.single('foto')