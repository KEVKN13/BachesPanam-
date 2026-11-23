const cloudinary = require('cloudinary').v2
const env = require('../config/env')

const configured = Boolean(
  env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret,
)

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  })
}

function isConfigured() {
  return configured
}

function uploadBuffer(buffer, { folder = 'baches-panama/reportes' } = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      },
    )

    stream.end(buffer)
  })
}

module.exports = { cloudinary, isConfigured, uploadBuffer }