# Server · Baches Panamá

API REST con Node.js + Express + MongoDB.

## Comandos

```bash
npm install
npm run dev          # recarga automática
npm run seed:admin   # crea/actualiza el usuario administrador
npm run seed:demo    # datos de ejemplo (usuario demo + 4 reportes)
npm start            # producción local
```

## Arquitectura

```text
src/
├── config/      # variables de entorno y constantes
├── controllers/ # peticiones y respuestas HTTP
├── middlewares/ # autenticación, roles, subida de fotos y errores
├── models/      # esquemas de User y Report
├── routes/      # /api/auth y /api/reports
├── services/    # reglas de negocio
└── utils/       # errores y validaciones
```

Las fotos se guardan en `uploads/` y se sirven públicamente en `/uploads/<archivo>`.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores. El archivo `.env` ya incluye valores para desarrollo local.
