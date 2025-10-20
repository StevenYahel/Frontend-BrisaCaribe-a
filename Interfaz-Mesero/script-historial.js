document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("historial-pedidos");
  const filtroMesero = document.getElementById("filtroMesero");
  const filtroMesa = document.getElementById("filtroMesa");
  const filtroFecha = document.getElementById("filtroFecha");
  const btnLimpiar = document.getElementById("limpiarFiltros");

  let pedidos = [];

  // 🔹 Cargar pedidos desde el backend Django
  async function cargarPedidos() {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/pedidos/");
      if (!response.ok) throw new Error("Error al obtener pedidos del servidor");
      pedidos = await response.json();
      mostrarPedidos(pedidos);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
      contenedor.innerHTML = "<p>Error al conectar con el servidor.</p>";
    }
  }

  // 🔹 Mostrar pedidos
  function mostrarPedidos(lista) {
    contenedor.innerHTML = "";

    if (!lista || lista.length === 0) {
      contenedor.innerHTML = "<p>No hay pedidos registrados.</p>";
      return;
    }

    lista.forEach((pedido, index) => {
      const div = document.createElement("div");
      div.className = "pedido";

      const platosHTML = pedido.platos
        ? pedido.platos.map(p => `<li>${p.nombre} - $${parseInt(p.precio).toLocaleString()}</li>`).join("")
        : "<li>Sin platos registrados</li>";

      const total = pedido.platos
        ? pedido.platos.reduce((acc, p) => acc + parseInt(p.precio || 0), 0)
        : 0;

      div.innerHTML = `
        <h3>Mesero: ${pedido.mesero || "Desconocido"}</h3>
        <p><strong>Mesa:</strong> ${pedido.mesa || "?"}</p>
        <p><strong>Comentario:</strong> ${pedido.comentario || "Sin comentario"}</p>
        <p><strong>Fecha:</strong> ${pedido.fecha ? new Date(pedido.fecha).toLocaleString() : "Desconocida"}</p>
        <ul>${platosHTML}</ul>
        <p><strong>Total:</strong> $${total.toLocaleString()}</p>
        <button class="btn-imprimir" data-index="${index}">
          <i class="fas fa-print"></i> Imprimir
        </button>
      `;

      contenedor.appendChild(div);
    });

    // Vincular los botones de impresión
    document.querySelectorAll(".btn-imprimir").forEach(btn => {
      btn.addEventListener("click", e => {
        const idx = e.target.closest("button").dataset.index;
        imprimirRecibo(lista[idx]);
      });
    });
  }

  // 🔹 Imprimir recibo
  function imprimirRecibo(pedido) {
    const total = pedido.platos
      ? pedido.platos.reduce((acc, p) => acc + parseInt(p.precio || 0), 0)
      : 0;

    const contenido = `
      <html>
      <head>
        <title>Recibo de Pedido</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #222; }
          h1 { color: #007b83; }
          ul { list-style: none; padding: 0; }
          li { margin: 5px 0; }
          .total { font-weight: bold; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Recibo de Pedido</h1>
        <p><strong>Mesero:</strong> ${pedido.mesero}</p>
        <p><strong>Mesa:</strong> ${pedido.mesa}</p>
        <p><strong>Fecha:</strong> ${pedido.fecha ? new Date(pedido.fecha).toLocaleString() : "Desconocida"}</p>
        <p><strong>Comentario:</strong> ${pedido.comentario || "Sin comentario"}</p>
        <ul>
          ${
            pedido.platos
              ? pedido.platos.map(p => `<li>${p.nombre} - $${parseInt(p.precio).toLocaleString()}</li>`).join("")
              : "<li>Sin platos registrados</li>"
          }
        </ul>
        <p class="total"><strong>Total:</strong> $${total.toLocaleString()}</p>
        <p>¡Gracias por su pedido!</p>
        <script>window.print();</script>
      </body>
      </html>
    `;

    const ventana = window.open("", "_blank");
    ventana.document.write(contenido);
    ventana.document.close();
  }

  // 🔹 Filtros
  function aplicarFiltros() {
    const mesero = filtroMesero.value.toLowerCase();
    const mesa = filtroMesa.value;
    const fecha = filtroFecha.value;

    const filtrados = pedidos.filter(pedido => {
      const fechaPedido = pedido.fecha ? pedido.fecha.split("T")[0] : "";
      return (
        (!mesero || pedido.mesero?.toLowerCase().includes(mesero)) &&
        (!mesa || pedido.mesa == mesa) &&
        (!fecha || fechaPedido === fecha)
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

  // 🚀 Inicializar carga de datos
  cargarPedidos();
});
