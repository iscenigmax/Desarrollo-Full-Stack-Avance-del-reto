// Servidor completo: Express + MongoDB (Mongoose) + autenticación con JWT
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // permite leer el JSON que envía el frontend
app.use(express.static('public')); // sirve el frontend (carpeta public)

// ---------- Modelos (la "forma" de los datos en MongoDB) ----------
const Usuario = mongoose.model('Usuario', {
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // se guarda encriptada
});

const Vehiculo = mongoose.model('Vehiculo', {
  marca: { type: String, required: true },
  modelo: { type: String, required: true },
  anio: { type: Number, required: true },
  precio: { type: Number, required: true },
});

// ---------- Middleware: solo deja pasar a quien envía un token válido ----------
function verificarToken(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'No autorizado' });
  }
}

function crearToken(usuario) {
  return jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
}

// ---------- Rutas de autenticación ----------
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Faltan datos' });
    const usuario = await Usuario.create({ username, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: crearToken(usuario) });
  } catch {
    res.status(400).json({ error: 'El usuario ya existe' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const usuario = await Usuario.findOne({ username });
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  res.json({ token: crearToken(usuario) });
});

// ---------- CRUD de vehículos (protegido con token) ----------
app.get('/api/vehiculos', verificarToken, async (req, res) => {
  res.json(await Vehiculo.find());
});

app.post('/api/vehiculos', verificarToken, async (req, res) => {
  try {
    res.status(201).json(await Vehiculo.create(req.body));
  } catch {
    res.status(400).json({ error: 'Datos inválidos' });
  }
});

app.put('/api/vehiculos/:id', verificarToken, async (req, res) => {
  try {
    const vehiculo = await Vehiculo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(vehiculo);
  } catch {
    res.status(400).json({ error: 'Datos inválidos' });
  }
});

app.delete('/api/vehiculos/:id', verificarToken, async (req, res) => {
  await Vehiculo.findByIdAndDelete(req.params.id);
  res.json({ mensaje: 'Eliminado' });
});

// ---------- Arranque ----------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(process.env.PORT || 3000, () => console.log('Servidor en http://localhost:3000')))
  .catch((err) => console.error('No se pudo conectar a MongoDB:', err.message));
