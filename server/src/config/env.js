const path = require('node:path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env'), quiet: true })

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/baches',
  jwtSecret: process.env.JWT_SECRET || 'cambia-este-secreto-en-produccion',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER || '',
  smtpPassword: process.env.SMTP_PASSWORD || '',
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || 'Baches Panamá <noreply@baches.local>',
  otpMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
  otpResendSeconds: Number(process.env.OTP_RESEND_SECONDS) || 60,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    url: process.env.CLOUDINARY_URL || '',
  },
  adminEmail: process.env.ADMIN_EMAIL || 'admin@baches.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin123!',
  uploadDir: path.resolve(__dirname, '../../uploads'),
  maxPhotoSizeMb: Number(process.env.MAX_PHOTO_SIZE_MB) || 5,
  defaultRadiusKm: Number(process.env.DEFAULT_RADIUS_KM) || 10,
  maxRadiusKm: Number(process.env.MAX_RADIUS_KM) || 50,
  bounds: {
    minLat: Number(process.env.MIN_LAT ?? 7.0),
    maxLat: Number(process.env.MAX_LAT ?? 9.7),
    minLng: Number(process.env.MIN_LNG ?? -83.1),
    maxLng: Number(process.env.MAX_LNG ?? -77.0),
  },
}

module.exports = env
