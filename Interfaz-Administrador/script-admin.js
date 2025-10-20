document.addEventListener("DOMContentLoaded", () => {
  // URL de tu backend Django
  const API_URL = "http://127.0.0.1:8000/api/pedidos/";

  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error("Error en la respuesta del servidor");
      return res.json();
    })
    .then(pedidos => {
      console.log("✅ Pedidos recibidos:", pedidos);  // <--- LOG

      // Obtener elementos del DOM
      const totalPedidos = document.getElementById("total-pedidos");
      const meserosActivos = document.getElementById("meseros-activos");
      const ventasTotales = document.getElementById("ventas-totales");

      // Total de pedidos
      totalPedidos.textContent = pedidos.length;

      // Meseros únicos
      const meseros = [...new Set(pedidos.map(p => p.mesero__nombre?.trim().toLowerCase()))];
      meserosActivos.textContent = meseros.length;

      // Ventas totales
      const totalVentas = pedidos.reduce((total, pedido) => {
        return total + (pedido.platos__precio || 0);
      }, 0);

      ventasTotales.textContent = `$${totalVentas.toLocaleString("es-CO")}`;
    })
    .catch(err => {
      console.error("❌ Error cargando pedidos:", err);
    });
});

// ===================================================
//  cargar total de meseros
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  const API_MESEROS = "http://127.0.0.1:8000/api/meseros/";

  fetch(API_MESEROS)
    .then(res => res.json())
    .then(meseros => {
      console.log("✅ Meseros recibidos:", meseros);  // <--- LOG
      const total = meseros.length;
      document.getElementById("total-meseros").textContent = total;
    })
    .catch(err => console.error("❌ Error cargando meseros:", err));
});
