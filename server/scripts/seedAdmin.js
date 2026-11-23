const path = require('node:path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true })

const User = require('../src/models/User')
const env = require('../src/config/env')

async function main() {
  await mongoose.connect(env.mongoUri)

  const email = env.adminEmail.trim().toLowerCase()
  const passwordHash = await bcrypt.hash(env.adminPassword, 10)

  const admin = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        nombre: 'Administrador',
        rol: 'admin',
        passwordHash,
        isVerified: true,
      },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )

  console.log(`Usuario administrador listo: ${admin.email}`)
  console.log('Contraseña tomada de ADMIN_PASSWORD en .env')

  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error('No se pudo crear el administrador:', error)
  await mongoose.disconnect()
  process.exit(1)
})
