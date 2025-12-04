document.addEventListener("DOMContentLoaded", () => {
  const carritoContainer = document.querySelector(".carrito-container");
  const botonesAgregar = document.querySelectorAll(".agregar-carrito");
  const btnRealizar = document.getElementById("realizarPedido");

  const API_URL = "http://localhost:8000";
  const API_PEDIDOS = `${API_URL}/api/pedidos/cliente/crear/`;
  const API_MESAS = `${API_URL}/api/mesas/disponibles/`;

  let enviandoPedido = false;
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let mesaId = null;

  // -------------------------------
  // Obtener primera mesa disponible automáticamente
  // -------------------------------
  async function obtenerMesaDisponible() {
    try {
      const res = await fetch(API_MESAS);
      const data = await res.json();
      if (data.length === 0) throw new Error("No hay mesas disponibles");
      mesaId = data[0].id; // Tomamos la primera libre
      console.log("Mesa asignada automáticamente:", mesaId);
    } catch (err) {
      mostrarEstado(`❌ Error al obtener mesa: ${err.message}`);
      throw err;
    }
  }

  obtenerMesaDisponible();

  // -------------------------------
  // Agregar productos al carrito
  // -------------------------------
  botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const producto = {
        id: boton.dataset.id,
        nombre: boton.dataset.nombre,
        precio: Number(boton.dataset.precio),
        icono: boton.dataset.icono || "fas fa-utensils",
        cantidad: 1
      };

      const existente = carrito.find((item) => item.id === producto.id);
      if (existente) {
        existente.cantidad += 1;
      } else {
        carrito.push(producto);
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
    });
  });

  // -------------------------------
  // Renderizar carrito
  // -------------------------------
  function renderCarrito() {
    if (!carritoContainer) return;
    carritoContainer.innerHTML = "";

    let total = 0;
    carrito.forEach((item, index) => {
      const subtotal = item.precio * item.cantidad;
      total += subtotal;

      const itemHTML = document.createElement("div");
      itemHTML.classList.add("item");
      itemHTML.innerHTML = `
        <div class="icono-plato"><i class="${item.icono}"></i></div>
        <div class="info">
          <h2>${item.nombre}</h2>
          <p>Cantidad: <span>${item.cantidad}</span></p>
          <p class="precio">$${subtotal.toLocaleString()}</p>
        </div>
        <button class="eliminar" data-index="${index}">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;
      carritoContainer.appendChild(itemHTML);
    });

    const resumenHTML = document.createElement("div");
    resumenHTML.classList.add("resumen");
    resumenHTML.innerHTML = `
      <h3>Total: <span>$${total.toLocaleString()}</span></h3>
      <button class="confirmar"><i class="fas fa-check-circle"></i> Confirmar Pedido</button>
    `;
    carritoContainer.appendChild(resumenHTML);
  }

  renderCarrito();

  // -------------------------------
  // Eliminar productos del carrito
  // -------------------------------
  carritoContainer?.addEventListener("click", (e) => {
    const btn = e.target.closest(".eliminar");
    if (btn) {
      const index = btn.dataset.index;
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
    }
  });

  // -------------------------------
  // Confirmar pedido
  // -------------------------------
  carritoContainer?.addEventListener("click", async (e) => {
    if (e.target.closest(".confirmar")) await enviarPedido();
  });

  btnRealizar?.addEventListener("click", async () => await enviarPedido());

  // -------------------------------
  // Enviar pedido al backend
  // -------------------------------
  async function enviarPedido() {
    if (enviandoPedido) {
      mostrarEstado("⏳ El pedido ya está siendo procesado. Por favor espera.");
      return;
    }

    if (!mesaId) {
      mostrarEstado("⚠️ No se pudo asignar una mesa. Intenta recargando la página.");
      return;
    }

    if (carrito.length === 0) {
      mostrarEstado("⚠️ El carrito está vacío. Agrega productos antes de continuar.");
      return;
    }

    const productos = carrito.map((item) => ({
      producto_id: Number(item.id),
      cantidad: Number(item.cantidad)
    }));

    const pedidoData = {
      mesa_id: mesaId,
      productos: productos
    };

    enviandoPedido = true;
    mostrarEstado("📦 Enviando pedido...");
    console.log("📤 Pedido:", pedidoData);

    try {
      const response = await fetch(API_PEDIDOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(pedidoData)
      });

      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: text }; }

      console.log("📥 Respuesta backend:", data);

      if (response.ok) {
        mostrarEstado("✅ Pedido registrado exitosamente.");
        carrito = [];
        localStorage.removeItem("carrito");
        renderCarrito();

        setTimeout(() => {
          window.location.href = "estado-pedido.html";
        }, 1500);
      } else {
        mostrarEstado(`⚠️ Error: ${data.error || data.message || "Error desconocido"}`);
      }

    } catch (err) {
      console.error("❌ Error en la conexión:", err);
      mostrarEstado(`❌ Error de conexión: ${err.message}`);
    } finally {
      enviandoPedido = false;
    }
  }

  // -------------------------------
  // Feedback visual dentro del carrito
  // -------------------------------
  function mostrarEstado(mensaje) {
    let statusDiv = document.querySelector(".estado-pedido");
    if (!statusDiv) {
      statusDiv = document.createElement("div");
      statusDiv.classList.add("estado-pedido");
      statusDiv.style.marginTop = "10px";
      statusDiv.style.fontWeight = "bold";
      carritoContainer?.appendChild(statusDiv);
    }
    statusDiv.textContent = mensaje;
  }
});
