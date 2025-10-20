document.addEventListener("DOMContentLoaded", () => {
  const carritoContainer = document.querySelector(".carrito-container");

  // Leer el carrito del localStorage
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  function renderCarrito() {
    carritoContainer.innerHTML = ""; // Limpiar antes

    let total = 0;

    carrito.forEach((item, index) => {
      const precioUnitario = Number(item.precio);
      const cantidad = Number(item.cantidad);

      // Validación extra por si se guarda mal
      if (isNaN(precioUnitario) || isNaN(cantidad)) return;

      const subtotal = precioUnitario * cantidad;
      total += subtotal;

      const itemHTML = document.createElement("div");
      itemHTML.classList.add("item");

      itemHTML.innerHTML = `
        <div class="icono-plato"><i class="${item.icono}"></i></div>
        <div class="info">
          <h2>${item.nombre}</h2>
          <p>Cantidad: <span class="cantidad">${cantidad}</span></p>
          <p class="precio">$${subtotal.toLocaleString()}</p>
        </div>
        <button class="eliminar" data-index="${index}">
          <i class="fas fa-trash-alt"></i>
        </button>
      `;

      carritoContainer.appendChild(itemHTML);
    });

    // Agregar resumen
    const resumenHTML = document.createElement("div");
    resumenHTML.classList.add("resumen");
    resumenHTML.innerHTML = `
      <h3>Total: <span>$${total.toLocaleString()}</span></h3>
      <button class="confirmar"><i class="fas fa-check-circle"></i> Confirmar Pedido</button>
    `;
    carritoContainer.appendChild(resumenHTML);
  }

  // Render inicial
  renderCarrito();

  // Eliminar producto
  carritoContainer.addEventListener("click", (e) => {
    if (e.target.closest(".eliminar")) {
      const index = e.target.closest(".eliminar").dataset.index;
      carrito.splice(index, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
    }
  });

  // Confirmar pedido
  carritoContainer.addEventListener("click", (e) => {
    if (e.target.closest(".confirmar")) {
      if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      const historial = JSON.parse(localStorage.getItem("historialPedidos")) || [];
      historial.push({
        fecha: new Date().toLocaleString(),
        pedido: carrito,
      });
      localStorage.setItem("historialPedidos", JSON.stringify(historial));

      carrito = [];
      localStorage.removeItem("carrito");
      renderCarrito();

      alert("¡Pedido confirmado!");
    }
  });
});
