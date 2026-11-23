# Baches Panamá

Aplicación web full stack para reportar, visualizar y votar baches en las vías de Panamá, y dar seguimiento a su estado.

## Stack

- **Frontend:** React + Vite + Leaflet/OpenStreetMap + Axios + Context API.
- **Backend:** Node.js + Express (rutas, controladores, servicios y modelos).
- **Base de datos:** MongoDB + Mongoose (índice geoespacial `2dsphere`).
- **Seguridad:** contraseñas con bcrypt y autenticación con JWT.
- **Archivos:** Multer guarda las fotos en `server/uploads`.

## Estructura

```text
Baches/
├── frontend/   # SPA React
├── server/     # API REST
└── docs        # Formulación e infografía del proyecto
```

## Puesta en marcha

### 1. Backend

```bash
cd server
npm install
npm run seed:admin   # crea el usuario administrador desde .env
npm run seed:demo    # opcional: carga 4 reportes de ejemplo
npm run dev
```

La API queda en `http://localhost:5000/api`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

## Usuario administrador

Se crea con `npm run seed:admin`. Por defecto en `server/.env`:

- Correo: `admin@baches.local`
- Contraseña: `Admin123!`

Cámbialos en `server/.env` antes de ejecutar el seed en un entorno real.

Para probar como ciudadano puedes usar `npm run seed:demo`, que crea:

- Correo: `demo@baches.local`
- Contraseña: `Demo123!`

## Endpoints principales

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Registrar ciudadano | Público |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) | Público |
| GET | `/api/auth/me` | Datos del usuario actual | Token |
| GET | `/api/reports` | Listar reportes (admite `lat`, `lng`, `radius`, `gravedad`, `estado`) | Público |
| GET | `/api/reports/:id` | Detalle de un reporte | Público |
| POST | `/api/reports` | Crear reporte (foto opcional) | Token |
| POST | `/api/reports/:id/vote` | Votar una vez por bache | Token |
| PATCH | `/api/reports/:id/status` | Cambiar estado | Admin |

## Estados y gravedades

- **Gravedad:** `bajo`, `medio`, `alto`.
- **Estado:** `Reportado`, `En revisión`, `Reparado`.

## Despliegue gratis (Vercel + Render + MongoDB Atlas)

### 1. Base de datos (MongoDB Atlas)
- Crea un cluster **M0** gratis.
- Crea usuario DB y permite acceso de red (`0.0.0.0/0` para Render, o IPs permitidas).
- Copia la URI en `MONGO_URI`.

### 2. Backend (Render Web Service)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Variables de entorno: usa `server/.env.example` como guía.
- `CLIENT_URL` debe incluir la URL de Vercel, ej: `https://tu-app.vercel.app`

### 3. Frontend (Vercel)
- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Variables de entorno:
  - `VITE_API_URL=https://tu-backend.onrender.com/api`
  - `VITE_API_ORIGIN=https://tu-backend.onrender.com`

### Notas
- Render free puede “dormir” el backend tras inactividad.
- Fotos: con Cloudinary configurado, las imágenes quedan persistentes.
- No subas `.env` al repositorio; usa `.env.example`.
