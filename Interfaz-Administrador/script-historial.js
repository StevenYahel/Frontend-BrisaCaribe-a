document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("historial-pedidos");
  const filtroMesero = document.getElementById("filtroMesero");
  const filtroMesa = document.getElementById("filtroMesa");
  const filtroFecha = document.getElementById("filtroFecha");
  const btnLimpiar = document.getElementById("limpiarFiltros");

  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  // 🔗 Cargar pedidos también desde el backend Django
  fetch("http://127.0.0.1:8000/api/pedidos/")
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener pedidos del servidor");
      return res.json();
    })
    .then(data => {
      pedidos = data; // Sobrescribe los pedidos locales con los del servidor
      localStorage.setItem("pedidos", JSON.stringify(pedidos)); // sincroniza en localStorage
      mostrarPedidos(pedidos);
    })
    .catch(err => {
      console.error("❌ No se pudo conectar con el servidor:", err);
      // Si falla el backend, muestra solo los pedidos guardados localmente
      mostrarPedidos(pedidos);
    });

  function mostrarPedidos(filtrados) {
    contenedor.innerHTML = "";

    if (filtrados.length === 0) {
      contenedor.innerHTML = "<p>No hay pedidos registrados.</p>";
      return;
    }

    filtrados.forEach(pedido => {
      const div = document.createElement("div");
      div.className = "pedido";

      const total = pedido.platos.reduce((sum, p) => sum + p.precio, 0);

      div.innerHTML = `
        <h3>Mesero: ${pedido.mesero}</h3>
        <p><strong>Mesa:</strong> ${pedido.mesa}</p>
        <p><strong>Comentario:</strong> ${pedido.comentario || "Sin comentario"}</p>
        <p><strong>Fecha:</strong> ${pedido.fecha}</p>
        <ul>
          ${pedido.platos.map(p => `<li>${p.nombre} - $${p.precio.toLocaleString()}</li>`).join("")}
        </ul>
        <p><strong>Total:</strong> $${total.toLocaleString()}</p>
        <button onclick="imprimirPedido(${JSON.stringify(pedido).replace(/"/g, '&quot;')})">
          <i class="fas fa-print"></i> Imprimir
        </button>
      `;

      contenedor.appendChild(div);
    });
  }

  function aplicarFiltros() {
    const mesero = filtroMesero.value.toLowerCase();
    const mesa = filtroMesa.value;
    const fecha = filtroFecha.value;

    const filtrados = pedidos.filter(pedido => {
      const fechaPedido = new Date(pedido.fecha).toISOString().split("T")[0];
      return (
        (!mesero || pedido.mesero.toLowerCase().includes(mesero)) &&
        (!mesa || pedido.mesa.includes(mesa)) &&
        (!fecha || fecha === fechaPedido)
      );
    });

    mostrarPedidos(filtrados);
  }

  filtroMesero.addEventListener("input", aplicarFiltros);
  filtroMesa.addEventListener("input", aplicarFiltros);
  filtroFecha.addEventListener("change", aplicarFiltros);
  btnLimpiar.addEventListener("click", () => {
    filtroMesero.value = "";
    filtroMesa.value = "";
    filtroFecha.value = "";
    mostrarPedidos(pedidos);
  });

  // Muestra inicialmente lo que haya (se sobrescribe si llega data del backend)
  mostrarPedidos(pedidos);
});

function imprimirPedido(pedido) {
  const ventana = window.open("", "_blank");
  const total = pedido.platos.reduce((sum, p) => sum + p.precio, 0);

  ventana.document.write(`
    <html>
    <head>
      <title>Recibo</title>
      <style>
        body { font-family: Arial; padding: 2rem; }
        h2 { margin-bottom: 0; }
        ul { padding-left: 1.2rem; }
        li { margin-bottom: 0.3rem; }
      </style>
    </head>
    <body>
      <h2>Recibo de Pedido</h2>
      <p><strong>Mesero:</strong> ${pedido.mesero}</p>
      <p><strong>Mesa:</strong> ${pedido.mesa}</p>
      <p><strong>Fecha:</strong> ${pedido.fecha}</p>
      <ul>
        ${pedido.platos.map(p => `<li>${p.nombre} - $${p.precio.toLocaleString()}</li>`).join("")}
      </ul>
      <p><strong>Total:</strong> $${total.toLocaleString()}</p>
      <p><em>Gracias por su visita.</em></p>
      <script>window.print();</script>
    </body>
    </html>
  `);
}
