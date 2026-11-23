const mongoose = require('mongoose')
const app = require('./src/app')
const env = require('./src/config/env')

async function start() {
  await mongoose.connect(env.mongoUri)
  console.log('MongoDB conectada correctamente')

  app.listen(env.port, () => {
    console.log(`API escuchando en http://localhost:${env.port}`)
    console.log(`Ruta base: http://localhost:${env.port}/api`)
  })
}

start().catch((error) => {
  console.error('No se pudo iniciar el servidor:', error)
  process.exit(1)
})
