// Guardamos el token en el navegador para recordar la sesión
let token = localStorage.getItem('token');
let editandoId = null;

const seccionLogin = document.getElementById('login');
const seccionApp = document.getElementById('app');
const mensaje = document.getElementById('mensaje');

// Función auxiliar: llama a la API enviando el token
async function api(url, metodo = 'GET', datos) {
  const res = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: datos ? JSON.stringify(datos) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json;
}

function mostrar() {
  seccionLogin.hidden = Boolean(token);
  seccionApp.hidden = !token;
  if (token) cargarVehiculos();
}

// ---------- Autenticación ----------
async function entrar(accion) {
  try {
    const datos = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
    };
    const resp = await api('/api/' + accion, 'POST', datos);
    token = resp.token;
    localStorage.setItem('token', token);
    mensaje.textContent = '';
    mostrar();
  } catch (e) {
    mensaje.textContent = e.message;
  }
}

document.getElementById('btn-login').onclick = () => entrar('login');
document.getElementById('btn-register').onclick = () => entrar('register');
document.getElementById('btn-salir').onclick = () => {
  token = null;
  localStorage.removeItem('token');
  mostrar();
};

// ---------- CRUD ----------
async function cargarVehiculos() {
  try {
    const lista = await api('/api/vehiculos');
    const tabla = document.getElementById('tabla');
    tabla.innerHTML = '';
    for (const v of lista) {
      const fila = document.createElement('tr');
      fila.innerHTML = '<td></td><td></td><td></td><td></td><td></td>';
      const celdas = fila.children;
      celdas[0].textContent = v.marca;
      celdas[1].textContent = v.modelo;
      celdas[2].textContent = v.anio;
      celdas[3].textContent = v.precio;

      const editar = document.createElement('button');
      editar.textContent = 'Editar';
      editar.onclick = () => {
        editandoId = v._id;
        document.getElementById('marca').value = v.marca;
        document.getElementById('modelo').value = v.modelo;
        document.getElementById('anio').value = v.anio;
        document.getElementById('precio').value = v.precio;
      };

      const borrar = document.createElement('button');
      borrar.textContent = 'Eliminar';
      borrar.onclick = async () => {
        await api('/api/vehiculos/' + v._id, 'DELETE');
        cargarVehiculos();
      };

      celdas[4].append(editar, borrar);
      tabla.appendChild(fila);
    }
  } catch {
    // token vencido: volver al login
    token = null;
    localStorage.removeItem('token');
    mostrar();
  }
}

document.getElementById('form-vehiculo').onsubmit = async (e) => {
  e.preventDefault();
  const datos = {
    marca: document.getElementById('marca').value,
    modelo: document.getElementById('modelo').value,
    anio: document.getElementById('anio').value,
    precio: document.getElementById('precio').value,
  };
  try {
    if (editandoId) await api('/api/vehiculos/' + editandoId, 'PUT', datos);
    else await api('/api/vehiculos', 'POST', datos);
    editandoId = null;
    e.target.reset();
    mensaje.textContent = '';
    cargarVehiculos();
  } catch (err) {
    mensaje.textContent = err.message;
  }
};

mostrar();
