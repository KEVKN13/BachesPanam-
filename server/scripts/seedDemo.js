const path = require('node:path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true })

const User = require('../src/models/User')
const Report = require('../src/models/Report')
const env = require('../src/config/env')

const demoReports = [
  {
    titulo: 'Bache en entrada a Corrugado',
    descripcion: 'Hueco profundo en la calle principal, entrada a Corrugado; los vehículos deben reducir velocidad.',
    lat: 9.46946814974847,
    lng: -82.51734211821883,
    gravedad: 'alto',
    estado: 'Reportado',
  },
  {
    titulo: 'Deterioro frente a Finca 76 COOBANA',
    descripcion: 'Baches en la calle dirección San San, frente a Finca 76 COOBANA; afecta el paso de transporte.',
    lat: 9.469189130129859,
    lng: -82.5234542156788,
    gravedad: 'medio',
    estado: 'En revisión',
  },
  {
    titulo: 'Bache después de Chiquita Banana',
    descripcion: 'Hueco en la calle principal, después del restaurante Chiquita Banana; riesgo para autos y motos.',
    lat: 9.458071700296314,
    lng: -82.51809887741945,
    gravedad: 'alto',
    estado: 'Reportado',
  },
  {
    titulo: 'Hueco en puente antes de Super Xtra',
    descripcion: 'Daño en el puente antes de Super Xtra; genera frenazos y peligro en horas pico.',
    lat: 9.449182331630299,
    lng: -82.51855919797171,
    gravedad: 'alto',
    estado: 'Reportado',
  },
  {
    titulo: 'Bache en entrada Finca 12',
    descripcion: 'Hundimiento en la entrada de Finca 12; se agrava con la lluvia.',
    lat: 9.444602069617675,
    lng: -82.51938173716908,
    gravedad: 'medio',
    estado: 'Reportado',
  },
  {
    titulo: 'Deterioro en entrada vía Las 60',
    descripcion: 'Bache reparado recientemente en la entrada vía Las 60; se mantiene en seguimiento.',
    lat: 9.437570977758533,
    lng: -82.5190967618216,
    gravedad: 'bajo',
    estado: 'Reparado',
  },
]

async function main() {
  await mongoose.connect(env.mongoUri)

  const email = 'demo@baches.local'
  const passwordHash = await bcrypt.hash('Demo123!', 10)

  const demoUser = await User.findOneAndUpdate(
    { email },
    {
      $set: { nombre: 'Ciudadano Demo', rol: 'ciudadano', passwordHash, isVerified: true },
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )

  for (const item of demoReports) {
    await Report.updateOne(
      { titulo: item.titulo },
      {
        $setOnInsert: {
          descripcion: item.descripcion,
          gravedad: item.gravedad,
          estado: item.estado,
          location: { type: 'Point', coordinates: [item.lng, item.lat] },
          fotoUrl: null,
          votos: [],
          historialEstados: [
            { estado: 'Reportado', fecha: new Date(), cambiadoPor: demoUser._id },
            ...(item.estado === 'Reportado'
              ? []
              : [{ estado: item.estado, fecha: new Date(), cambiadoPor: demoUser._id }]),
          ],
          creadoPor: demoUser._id,
        },
      },
      { upsert: true },
    )
  }

  console.log(`Datos de demostración listos (${demoReports.length} reportes).`)
  console.log('Usuario demo: demo@baches.local / Demo123!')

  await mongoose.disconnect()
}

main().catch(async (error) => {
  console.error('No se pudieron cargar los datos de demostración:', error)
  await mongoose.disconnect()
  process.exit(1)
})
