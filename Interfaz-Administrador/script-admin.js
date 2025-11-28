document.addEventListener("DOMContentLoaded", () => {
  // --- Validar login ---
  const logueado = localStorage.getItem("adminLogueado");
  if (!logueado || logueado !== "true") {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login-admin.html";
    return;
  }

  // --- Dashboard ---
  cargarResumenDashboard();
  cargarEstadisticas();
  setInterval(cargarResumenDashboard, 5000);

  // --- Formulario de nuevo plato ---
  const form = document.getElementById("form-nuevo-plato");
  if (form) form.addEventListener("submit", crearPlato);

  // --- Cargar categorías ---
  cargarCategorias();
});

// ===========================
// FUNCIONES DASHBOARD
// ===========================
async function cargarResumenDashboard() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/dashboard/resumen/");
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error ${response.status}: ${text}`);
    }
    const data = await response.json();

    const totalPedidosElem = document.getElementById("total-pedidos");
    const meserosActivosElem = document.getElementById("meseros-activos");
    const ventasTotalesElem = document.getElementById("ventas-totales");
    const totalMeserosElem = document.getElementById("total-meseros");

    if (totalPedidosElem) totalPedidosElem.textContent = data.total_pedidos;
    if (meserosActivosElem) meserosActivosElem.textContent = data.meseros_activos;
    if (ventasTotalesElem) ventasTotalesElem.textContent = `$${data.ventas_totales}`;
    if (totalMeserosElem) totalMeserosElem.textContent = data.total_meseros;

  } catch (error) {
    console.error("⚠️ Error al cargar el dashboard:", error);
  }
}

async function cargarEstadisticas() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/dashboard/estadisticas/");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }
    const data = await res.json();

    const fechasVentas = data.ventas_por_dia.map(v => v.fecha);
    const montosVentas = data.ventas_por_dia.map(v => v.total);

    const fechasPedidos = data.pedidos_por_dia.map(p => p.fecha);
    const totalesPedidos = data.pedidos_por_dia.map(p => p.total);

    renderChart("graficoVentas", "Ventas Diarias", fechasVentas, montosVentas, "rgba(75, 192, 192, 0.6)", "chartVentas");
    renderChart("graficoPedidos", "Pedidos Diarios", fechasPedidos, totalesPedidos, "rgba(54, 162, 235, 0.6)", "chartPedidos");

  } catch (error) {
    console.error("⚠️ Error al cargar estadísticas:", error);
  }
}

function renderChart(canvasId, titulo, etiquetas, datos, color, chartVarName) {
  const ctxElem = document.getElementById(canvasId);
  if (!ctxElem) return;

  const ctx = ctxElem.getContext("2d");

  if (window[chartVarName]) {
    window[chartVarName].destroy();
  }

  window[chartVarName] = new Chart(ctx, {
    type: "bar",
    data: {
      labels: etiquetas,
      datasets: [{
        label: titulo,
        data: datos,
        backgroundColor: color,
        borderColor: color.replace('0.6', '1'),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: titulo,
          font: { size: 18 }
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// ===========================
// FUNCIONES CATEGORIAS
// ===========================
async function cargarCategorias() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/categorias/");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }
    const data = await res.json();
    const select = document.getElementById("categoria");
    if (!select) return;

    data.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.nombre;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error("❌ Error al cargar categorías:", err);
  }
}

// ===========================
// FUNCION CREAR PLATO
// ===========================
async function crearPlato(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre")?.value;
  const precio = document.getElementById("precio")?.value;
  const descripcion = document.getElementById("descripcion")?.value;
  const categoria = document.getElementById("categoria")?.value;
  const imagen = document.getElementById("imagen")?.files[0];

  const formData = new FormData();
  formData.append("nombre", nombre);
  formData.append("precio", precio);
  formData.append("descripcion", descripcion);
  formData.append("categoria", categoria);
  if (imagen) formData.append("imagen", imagen);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/productos/", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }
    const data = await res.json();

    const mensajeElem = document.getElementById("mensaje-plato");
    if (mensajeElem) mensajeElem.textContent = "✅ Plato agregado con éxito.";
    document.getElementById("form-nuevo-plato")?.reset();

    console.log("Nuevo plato:", data);
  } catch (error) {
    const mensajeElem = document.getElementById("mensaje-plato");
    if (mensajeElem) mensajeElem.textContent = "❌ No se pudo agregar el plato.";
    console.error("⚠️ Error al crear el plato:", error);
  }
}

async function cargarTiemposPedidos() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/pedidos/tiempos/");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Error ${res.status}: ${text}`);
    }
    const data = await res.json();

    const etiquetas = data.map(p => `Pedido #${p.id}`);
    const tiempos = data.map(p => p.tiempo_preparacion_min);

    // Calcular promedio
    const promedio = tiempos.reduce((a,b) => a+b, 0) / tiempos.length;
    const promedioArray = new Array(tiempos.length).fill(promedio);

    const ctx = document.getElementById('graficoTiempos').getContext('2d');

    if (window.chartTiempos) window.chartTiempos.destroy();

    window.chartTiempos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Tiempo de Preparación (min)',
            data: tiempos,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          },
          {
            label: 'Promedio',
            data: promedioArray,
            type: 'line',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: 'Tiempos de Preparación de Pedidos vs Promedio',
            font: { size: 18 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Minutos' }
          },
          x: {
            title: { display: true, text: 'Pedidos' }
          }
        }
      }
    });

  } catch (error) {
    console.error("⚠️ Error al cargar tiempos de pedidos:", error);
  }
}


  cargarTiemposPedidos(); // cargar al inicio
  setInterval(cargarTiemposPedidos, 5000); // actualizar cada 5s

