// Cambia esto según tu host y puerto de Django
const API_BASE = 'http://127.0.0.1:8000/api';

// Función para obtener productos desde la API
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos/`);
    if (!res.ok) throw new Error('Error al obtener productos');
    const productos = await res.json();

    const menu = document.querySelector('.menu-container');
    menu.innerHTML = ''; // Limpiar productos antiguos

    productos.forEach(producto => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h2>${producto.nombre}</h2>
        <p class="precio">$${producto.precio}</p>
        <p>${producto.descripcion}</p>
        <button class="btn-agregar" data-id="${producto.id}">
          <i class="fas fa-cart-plus"></i> Añadir
        </button>
      `;
      menu.appendChild(card);
    });

    // Agregar eventos a los botones
    document.querySelectorAll('.btn-agregar').forEach(btn => {
      btn.addEventListener('click', async () => {
        const productoId = btn.dataset.id;
        try {
          const res = await fetch(`${API_BASE}/carrito/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken') // Django CSRF
            },
            body: JSON.stringify({ producto_id: productoId, cantidad: 1 })
          });
          if (!res.ok) throw new Error('No se pudo agregar al carrito');
          alert('Producto agregado al carrito ✅');
          actualizarContador();
        } catch (err) {
          console.error(err);
          alert('Error al agregar producto al carrito');
        }
      });
    });

  } catch (error) {
    console.error('Error cargando productos:', error);
  }
}

// Función para actualizar contador de carrito
async function actualizarContador() {
  try {
    const res = await fetch(`${API_BASE}/carrito/`);
    if (!res.ok) throw new Error('Error al obtener carrito');
    const carrito = await res.json();

    document.getElementById('contador-carrito').textContent = carrito.length;

    const lista = document.getElementById('lista-carrito');
    lista.innerHTML = '';
    carrito.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.cantidad} x ${item.producto.nombre}`;
      lista.appendChild(li);
    });

  } catch (error) {
    console.error('Error actualizando carrito:', error);
  }
}

// Función para obtener CSRF token de Django
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  cargarProductos();
  actualizarContador();
});
