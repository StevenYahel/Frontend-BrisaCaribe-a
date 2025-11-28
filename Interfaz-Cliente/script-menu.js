const API_BASE = "http://127.0.0.1:8000/api";

// ============================
// Cargar los productos del backend
// ============================
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos/`);
    if (!res.ok) throw new Error("Error al obtener productos");
    const productos = await res.json();

    // Contenedor donde se renderiza el menú
    const menu = document.querySelector(".menu-container");
    menu.innerHTML = "";

    productos.forEach((producto) => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h2>${producto.nombre}</h2>
        <p class="precio">$${producto.precio}</p>
        <p>${producto.descripcion}</p>
        <button class="btn-agregar"
          data-id="${producto.id}"
          data-nombre="${producto.nombre}"
          data-precio="${producto.precio}"
          data-icono="fas fa-utensils">
          <i class="fas fa-cart-plus"></i> Añadir
        </button>
      `;

      menu.appendChild(card);
    });

    
    document.querySelectorAll(".btn-agregar").forEach((btn) => {
      btn.addEventListener("click", () => {
        agregarAlCarrito(btn);
      });
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ============================
// Agregar productos al carrito
// ============================
function agregarAlCarrito(btn) {
  const id = btn.dataset.id;
  const nombre = btn.dataset.nombre;
  const precio = parseFloat(btn.dataset.precio);
  const icono = btn.dataset.icono;

  // Leer carrito actual del localStorage
  let carrito = JSON.parse(localStorage.getItem("carrito"));


  if (!Array.isArray(carrito)) {
    carrito = [];
  }

  // Buscar si ya existe el producto
  const existente = carrito.find((item) => item.id === id);

  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({
      id,
      nombre,
      precio,
      cantidad: 1,
      icono,
    });
  }

  // Guardar en localStorage
  localStorage.setItem("carrito", JSON.stringify(carrito));

  // Actualizar contador
  actualizarContador();

  
  alert(`🍽️ ${nombre} agregado al carrito`);
}


function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem("carrito"));
  const contador = document.getElementById("contador-carrito");

  if (contador) {
    if (Array.isArray(carrito)) {
      
      const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
      contador.textContent = totalItems;
    } else {
      contador.textContent = 0;
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarContador();
});
