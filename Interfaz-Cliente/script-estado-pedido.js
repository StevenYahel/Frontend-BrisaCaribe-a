document.addEventListener("DOMContentLoaded", () => {
  const historial = JSON.parse(localStorage.getItem("historialPedidos")) || [];

  if (historial.length === 0) {
    document.querySelector(".estado-container").innerHTML = `
      <h2>Estado del Pedido</h2>
      <p>No tienes pedidos en proceso.</p>
      <button class="btn-volver" onclick="window.location.href='dashboard-cliente.html'">
        <i class="fas fa-arrow-left"></i> Volver al panel
      </button>
    `;
    return;
  }

  const ultimo = historial[historial.length - 1];

  const estados = [
    { texto: "Preparando tu pedido 🍤", progreso: 40, icono: "fas fa-utensils" },
    { texto: "Pedido en cocina 👨‍🍳", progreso: 60, icono: "fas fa-fire" },
    { texto: "En camino 🛵", progreso: 90, icono: "fas fa-motorcycle" },
    { texto: "Entregado ✅", progreso: 100, icono: "fas fa-check-circle" }
  ];

  // cambia cada vez que visitas la página
  const indice = Math.floor(Math.random() * estados.length);
  const estado = estados[indice];

  document.querySelector(".estado-container").innerHTML = `
    <h2>Estado del Pedido</h2>
    <div class="pedido-info">
      <p><strong>#Pedido:</strong> ${historial.length + 1000}</p>
      <p><strong>Fecha:</strong> ${ultimo.fecha}</p>
    </div>
    <div class="progreso">
      <div class="barra" style="width: ${estado.progreso}%;"></div>
    </div>
    <div class="estado-texto">${estado.texto}</div>
    <div class="icono-estado"><i class="${estado.icono}"></i></div>
    <button class="btn-volver" onclick="window.location.href='dashboard-cliente.html'">
      <i class="fas fa-arrow-left"></i> Volver al panel
    </button>
  `;
});