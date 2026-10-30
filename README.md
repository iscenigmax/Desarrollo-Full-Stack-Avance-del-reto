# Gestión de Vehículos

App full stack básica: **Node.js + Express + MongoDB + JWT**, con frontend en HTML, CSS y JavaScript.

## Estructura

- `server.js`: todo el backend (modelos, login, CRUD).
- `public/`: el frontend (`index.html`, `styles.css`, `app.js`).
- `.env`: configuración (puerto, conexión a MongoDB, secreto del JWT).

## Cómo ejecutarla

1. Tener MongoDB corriendo (contenedor `mongodb-local`, puerto 27017).
2. `copy .env.example .env`
3. `npm install`
4. `npm start` y abrir http://localhost:3000

## API

| Método | Ruta | Requiere token | Qué hace |
|---|---|---|---|
| POST | `/api/register` | No | Crea usuario y devuelve token |
| POST | `/api/login` | No | Devuelve token |
| GET | `/api/vehiculos` | Sí | Lista vehículos |
| POST | `/api/vehiculos` | Sí | Crea vehículo |
| PUT | `/api/vehiculos/:id` | Sí | Actualiza vehículo |
| DELETE | `/api/vehiculos/:id` | Sí | Elimina vehículo |

El token se envía en el encabezado `Authorization: Bearer <token>`.

## Despliegue

En la nube (Render, Railway…): definir `MONGODB_URI` y `JWT_SECRET`, comando de inicio `npm start`.
