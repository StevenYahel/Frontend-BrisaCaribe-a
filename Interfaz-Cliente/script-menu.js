const API_BASE = "http://127.0.0.1:8000/api";

// ============================
// 📌 1️⃣ Mapa de imágenes locales
// ============================

const imagenesLocales = {
  "arroz_de_camaron": "img/arroz-camaron.jpg",
  "arroz_coco": "img/arroz-coco.jpg",
  "cazuela": "img/cazuela.jpg",
  "ceviche": "img/ceviche.jpg",
  "fondi": "img/fondi.jpg",
  "logo": "img/logo.png",
  "mojarra_frita": "img/mojarra.jpg",
  "sopa_costena": "img/sopa-costeña.jpg"
};


// ============================
// 📌 2️⃣ Cargar productos del backend
// ============================
async function cargarProductos() {
  try {
    const res = await fetch(`${API_BASE}/productos/`);
    if (!res.ok) throw new Error("Error al obtener productos");
    const productos = await res.json();

    const menu = document.querySelector(".menu-container");
    menu.innerHTML = "";

    productos.forEach((producto) => {
      // ============================
      // Imagen del producto (locales)
      // ============================
      const nombreNormalizado = normalizarNombre(producto.nombre);
      const rutaImagen = imagenesLocales[nombreNormalizado]
        ? imagenesLocales[nombreNormalizado]
        : "img/productos/default.jpg";

      // ============================
      // Crear tarjeta del producto
      // ============================
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <img src="${rutaImagen}" alt="${producto.nombre}"
             onerror="this.onerror=null;this.src='img/productos/default.jpg';">
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

    // ============================
    // Agregar eventos a botones
    // ============================
    document.querySelectorAll(".btn-agregar").forEach((btn) => {
      btn.addEventListener("click", () => agregarAlCarrito(btn));
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// ============================
// 📌 3️⃣ Normalizar nombre para archivos de imagen
// ============================
function normalizarNombre(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, "_")            // reemplaza espacios por guión bajo
    .toLowerCase();                  // todo en minúsculas
}

// ============================
// 📌 4️⃣ Agregar productos al carrito
// ============================
function agregarAlCarrito(btn) {
  const id = btn.dataset.id;
  const nombre = btn.dataset.nombre;
  const precio = parseFloat(btn.dataset.precio);
  const icono = btn.dataset.icono;

  let carrito = JSON.parse(localStorage.getItem("carrito"));
  if (!Array.isArray(carrito)) carrito = [];

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

  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContador();
  alert(`🍽️ ${nombre} agregado al carrito`);
}

// ============================
// 📌 5️⃣ Actualizar contador del carrito
// ============================
function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem("carrito"));
  const contador = document.getElementById("contador-carrito");

  if (contador) {
    const totalItems = Array.isArray(carrito)
      ? carrito.reduce((acc, item) => acc + item.cantidad, 0)
      : 0;
    contador.textContent = totalItems;
  }
}

// ============================
// 📌 6️⃣ Agregar nuevo producto con imagen desde formulario
// ============================
function agregarProductoFormulario() {
  const nombre = document.getElementById("producto-nombre").value;
  const precio = parseFloat(document.getElementById("producto-precio").value);
  const descripcion = document.getElementById("producto-descripcion").value;
  const inputImagen = document.getElementById("producto-imagen");

  if (!nombre || !precio || !descripcion) {
    alert("Completa todos los campos");
    return;
  }

  // Generar URL temporal para la imagen subida
  let imagenURL = "img/productos/default.jpg";
  if (inputImagen.files && inputImagen.files[0]) {
    imagenURL = URL.createObjectURL(inputImagen.files[0]);
  }

  const nuevoProducto = {
    id: Date.now().toString(),
    nombre,
    precio,
    descripcion,
    imagen: imagenURL,
  };

  // Crear tarjeta para el nuevo producto
  const menu = document.querySelector(".menu-container");
  const card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <img src="${imagenURL}" alt="${nombre}" onerror="this.onerror=null;this.src='img/productos/default.jpg';">
    <h2>${nombre}</h2>
    <p class="precio">$${precio}</p>
    <p>${descripcion}</p>
    <button class="btn-agregar"
      data-id="${nuevoProducto.id}"
      data-nombre="${nombre}"
      data-precio="${precio}"
      data-icono="fas fa-utensils">
      <i class="fas fa-cart-plus"></i> Añadir
    </button>
  `;
  menu.appendChild(card);

  // Evento para agregar al carrito
  card.querySelector(".btn-agregar").addEventListener("click", () =>
    agregarAlCarrito(card.querySelector(".btn-agregar"))
  );

  // Limpiar formulario
  document.getElementById("form-producto").reset();
}

// ============================
// 📌 7️⃣ Inicialización del menú
// ============================
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
  actualizarContador();

  // Formulario de productos
  const form = document.getElementById("form-producto");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      agregarProductoFormulario();
    });
  }
});
