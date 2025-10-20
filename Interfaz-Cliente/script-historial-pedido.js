document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));
  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  const historial = JSON.parse(localStorage.getItem("historialPedidos")) || [];
  const contenedor = document.getElementById("contenedorHistorial");

  if (historial.length === 0) {
    contenedor.innerHTML = `<p class="sin-pedidos">No tienes pedidos anteriores.</p>`;
    return;
  }

  historial.reverse();

  historial.forEach((pedido, index) => {
    const total = pedido.pedido.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

    const card = document.createElement("div");
    card.classList.add("pedido-card");

    card.innerHTML = `
      <div class="info">
        <h3>Pedido #${1020 + index}</h3>
        <p><strong>Fecha:</strong> ${pedido.fecha}</p>
        <p><strong>Total:</strong> $${total.toLocaleString()}</p>
        <p><strong>Estado:</strong> Entregado</p>
      </div>
      <div class="acciones">
        <button class="btn-repetir" data-index="${index}">
          <i class="fas fa-redo-alt"></i> Repetir
        </button>
        <button class="btn-eliminar" data-index="${index}">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  // Repetir pedido
  contenedor.addEventListener("click", (e) => {
    if (e.target.closest(".btn-repetir")) {
      const index = e.target.closest(".btn-repetir").dataset.index;
      const pedidoSeleccionado = historial[historial.length - 1 - index];
      localStorage.setItem("carrito", JSON.stringify(pedidoSeleccionado.pedido));
      alert("Pedido añadido nuevamente al carrito.");
      window.location.href = "carrito.html";
    }
  });

  // Eliminar pedido
  contenedor.addEventListener("click", (e) => {
    if (e.target.closest(".btn-eliminar")) {
      const index = e.target.closest(".btn-eliminar").dataset.index;
      historial.splice(historial.length - 1 - index, 1);
      localStorage.setItem("historialPedidos", JSON.stringify(historial));
      window.location.reload();
    }
  });
});