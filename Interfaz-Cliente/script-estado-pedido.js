document.addEventListener("DOMContentLoaded", () => {
    const contenedor = document.querySelector(".estado-container");

    if (!contenedor) {
        console.error("No se encontró el contenedor de pedidos");
        return;
    }

    // -----------------------------
    // DEFINIR mesaId (tomar del login o poner fijo para pruebas)
    // -----------------------------
    const mesaId = 1; // <- reemplaza 1 por la mesa correspondiente
    if (!mesaId) {
        contenedor.innerHTML = `
            <h2>Estado del Pedido</h2>
            <p>No se encontró la mesa. Inicia sesión nuevamente.</p>
            <button class="btn-volver" onclick="window.location.href='login.html'">
                <i class="fas fa-arrow-left"></i> Iniciar sesión
            </button>
        `;
        return;
    }

    // -----------------------------
    // Endpoint del backend
    // -----------------------------
    const API = `http://127.0.0.1:8000/api/pedidos-mesa/?mesa_id=${mesaId}`;

    // -----------------------------
    // Map de estados
    // -----------------------------
    const estadosMap = {
        "pendiente": { progreso: 20, texto: "Pedido recibido 📝", icono: "fas fa-receipt" },
        "en_preparacion": { progreso: 50, texto: "Preparando tu pedido 🍤", icono: "fas fa-utensils" },
        "en preparacion": { progreso: 50, texto: "Preparando tu pedido 🍤", icono: "fas fa-utensils" },
        "servido": { progreso: 80, texto: "Pedido servido 🛵", icono: "fas fa-motorcycle" },
        "pagado": { progreso: 100, texto: "Pedido pagado ✅", icono: "fas fa-check-circle" },
        "cancelado": { progreso: 0, texto: "Pedido cancelado ❌", icono: "fas fa-times-circle" }
    };

    function normalizarEstado(estado) {
        return estado.trim().toLowerCase();
    }

    // -----------------------------
    // Función principal
    // -----------------------------
    async function cargarEstadoPedido() {
        try {
            const response = await fetch(API);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            const pedidos = await response.json();

            if (!pedidos.length) {
                contenedor.innerHTML = `
                    <h2>Estado del Pedido</h2>
                    <p>No tienes pedidos en proceso.</p>
                    <button class="btn-volver" onclick="window.location.href='dashboard-cliente.html'">
                        <i class="fas fa-arrow-left"></i> Volver al panel
                    </button>
                `;
                return;
            }

            // Tomamos el último pedido
            const ultimo = pedidos[pedidos.length - 1];

            // Normalizar estado
            const estadoKey = normalizarEstado(ultimo.estado);
            const estado = estadosMap[estadoKey] || { progreso: 40, texto: "En proceso...", icono: "fas fa-clock" };

            // Renderizar
            contenedor.innerHTML = `
                <h2>Estado del Pedido</h2>

                <div class="pedido-info">
                    <p><strong>#Pedido:</strong> ${ultimo.id}</p>
                    <p><strong>Mesa:</strong> ${ultimo.mesa.numero}</p>
                    <p><strong>Fecha:</strong> ${new Date(ultimo.fecha_hora).toLocaleString()}</p>
                </div>

                <div class="progreso">
                    <div class="barra" style="width: ${estado.progreso}%;"></div>
                </div>

                <div class="estado-texto">${estado.texto}</div>
                <div class="icono-estado"><i class="${estado.icono}"></i></div>

                <h3>Detalle del pedido:</h3>
                <div class="detalle-pedido">
                    ${ultimo.detalles.map(d => `
                        <div>${d.cantidad} × ${d.producto_nombre} — $${parseFloat(d.subtotal).toLocaleString()}</div>
                    `).join("")}
                    <div style="margin-top:10px; font-weight:bold;">
                        Total: $${parseFloat(ultimo.total).toLocaleString()}
                    </div>
                </div>

                <button class="btn-volver" onclick="window.location.href='dashboard-cliente.html'">
                    <i class="fas fa-arrow-left"></i> Volver al panel
                </button>
            `;
        } catch (err) {
            console.error("Error cargando pedido:", err);
            contenedor.innerHTML = `<p style="color:red;">No se pudo cargar el estado del pedido.</p>`;
        }
    }

    cargarEstadoPedido();
    setInterval(cargarEstadoPedido, 10000); // actualizar cada 10 segundos
});
