# Frontend · Baches Panamá

SPA de React con Vite para reportar baches en un mapa de OpenStreetMap.

## Desarrollo

```bash
npm install
npm run dev
```

Variables de entorno (ver `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
VITE_API_ORIGIN=http://localhost:5000
```

## Comandos

- `npm run dev`: servidor de desarrollo en `http://localhost:5173`.
- `npm run build`: compilación de producción en `dist/`.
- `npm run lint`: análisis estático con Oxlint.
- `npm run preview`: vista previa de la compilación.

## Estructura

```text
src/
├── api/          # cliente Axios y helpers
├── components/   # Header, mapa, formulario, lista, detalle y login
├── context/      # AuthContext y ReportsContext
├── utils/        # íconos de Leaflet y formateo
├── App.jsx       # composición de la pantalla principal
└── index.css     # estilos globales
```
