document.addEventListener("DOMContentLoaded", () => {
    obtenerPedidos();
    setInterval(obtenerPedidos, 5000); 
    conectarWebSocket();
});

let pedidosPrevios = [];
let socket;

// ===============================
// Obtener pedidos de cocina
// ===============================
async function obtenerPedidos() {
    const contenedor = document.getElementById("pedidos-cocina");
    if (!contenedor) return;

    try {
        const response = await fetch("http://localhost:8000/api/pedidos-cocina/");
        const pedidos = await response.json();

        // Aviso si hay nuevos pedidos
        if (pedidos.length > pedidosPrevios.length) {
            reproducirAlerta();
            mostrarNotificacion("¡Nuevo pedido recibido!");
        }

        pedidosPrevios = [...pedidos];
        contenedor.innerHTML = "";

        if (pedidos.length === 0) {
            contenedor.innerHTML = "<p>No hay pedidos pendientes.</p>";
            return;
        }

        pedidos.forEach(pedido => {
            const div = document.createElement("div");
            div.className = "pedido-card";
            div.id = `pedido-${pedido.id}`;

            const mesa = pedido.mesa ?? "N/A";
            const mesero = pedido.mesero ?? "Sin asignar";

            let detallesHTML = "<ul>";
            pedido.detalles.forEach(det => {
                detallesHTML += `<li>${det.cantidad} × ${det.producto_nombre} 
                    <span style="font-size:12px; color:#555;">($${det.subtotal})</span></li>`;
            });
            detallesHTML += "</ul>";

            div.innerHTML = `
                <h3>Pedido #${pedido.id}</h3>
                <p><strong>Mesa:</strong> ${mesa}</p>
                <p><strong>Mesero:</strong> ${mesero}</p>

                <p><strong>Productos:</strong></p>
                <div class="detalle-productos">${detallesHTML}</div>

                <div class="estado">
                    <select data-pedido="${pedido.id}" onchange="cambiarEstado(${pedido.id}, this.value)">
                        <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                        <option value="en_preparacion" ${pedido.estado === 'en_preparacion' ? 'selected' : ''}>Preparando</option>
                        <option value="listo" ${pedido.estado === 'listo' ? 'selected' : ''}>Listo</option>
                        <option value="servido" ${pedido.estado === 'servido' ? 'selected' : ''}>Servido</option>
                        <option value="pagado" ${pedido.estado === 'pagado' ? 'selected' : ''}>Pagado</option>
                        <option value="cancelado" ${pedido.estado === 'cancelado' ? 'selected' : ''}>Cancelado</option>
                        <option value="retrasado" ${pedido.estado === 'retrasado' ? 'selected' : ''}>🚨 Retrasado</option>
                    </select>
                </div>

                <button class="btn-retraso" onclick="marcarRetraso(${pedido.id})">🚨 Marcar como retrasado</button>
            `;

            contenedor.appendChild(div);
        });

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        contenedor.innerHTML = `<p style="color:red;">No se pudieron cargar los pedidos.</p>`;
    }
}

// ===============================
// Cambiar estado del pedido
// ===============================
async function cambiarEstado(id, estadoSeleccionado) {
    const select = document.querySelector(`select[data-pedido="${id}"]`);
    const estadoAnterior = select.value;

    const estadoLimpio = String(estadoSeleccionado)
        .trim()
        .toLowerCase()
        .replace(/[áàä]/g, "a")
        .replace(/[éèë]/g, "e")
        .replace(/[íìï]/g, "i")
        .replace(/[óòö]/g, "o")
        .replace(/[úùü]/g, "u")
        .replace(/[\s-]+/g, "_");

    try {
        const response = await fetch(`http://localhost:8000/api/pedidos/${id}/estado/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: estadoLimpio })
        });

        if (!response.ok) {
            let mensajeError = "No se pudo actualizar el estado";
            try {
                const errorData = await response.json();
                mensajeError = errorData.detail || mensajeError;
            } catch (_) {}
            console.error("Error backend:", mensajeError);
            mostrarNotificacion("⚠ " + mensajeError);
            select.value = estadoAnterior;
            return;
        }

        const data = await response.json();
        const estadoFinal = data.estado_normalizado || data.pedido?.estado || estadoLimpio;
        select.value = estadoFinal;
        mostrarNotificacion(`Estado actualizado a: ${estadoFinal.replace("_", " ")}`);

        actualizarCardPedido(id);

    } catch (e) {
        console.error("Error de conexión:", e);
        mostrarNotificacion("⚠ Error de conexión con el servidor");
        select.value = estadoAnterior;
    }
}

// ===============================
// Refrescar card individual
// ===============================
async function actualizarCardPedido(id) {
    try {
        const response = await fetch("http://localhost:8000/api/pedidos-cocina/");
        const pedidos = await response.json();
        const pedido = pedidos.find(p => p.id === id);
        if (!pedido) return;

        const card = document.querySelector(`#pedido-${id}`);
        if (!card) return;

        const select = card.querySelector("select");
        select.value = pedido.estado;

        let detallesHTML = "<ul>";
        pedido.detalles.forEach(det => {
            detallesHTML += `<li>${det.cantidad} × ${det.producto_nombre} 
                <span style="font-size:12px; color:#555;">($${det.subtotal})</span></li>`;
        });
        detallesHTML += "</ul>";
        card.querySelector(".detalle-productos").innerHTML = detallesHTML;

    } catch (e) {
        console.error("Error refrescando card:", e);
    }
}

// ===============================
// Marcar como retrasado
// ===============================
async function marcarRetraso(id) {
    try {
        await fetch(`http://localhost:8000/api/pedidos/${id}/estado/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "retrasado" })
        });

        mostrarNotificacion("🚨 Pedido marcado como retrasado");
        reproducirAlerta();
        actualizarCardPedido(id);

    } catch (error) {
        console.error("Error marcando retraso:", error);
        mostrarNotificacion("Error al marcar retraso");
    }
}

// ===============================
// Alertas y sonido
// ===============================
function reproducirAlerta() {
    const audio = new Audio("notificacion.mp3");
    audio.play().catch(() => {});
}

function mostrarNotificacion(msg) {
    let noti = document.getElementById("notification");
    if (!noti) {
        noti = document.createElement("div");
        noti.id = "notification";
        noti.className = "notification";
        document.body.appendChild(noti);
    }
    noti.textContent = msg;
    noti.classList.add("show");
    setTimeout(() => noti.classList.remove("show"), 4000);
}

// ===============================
// WebSocket
// ===============================
function conectarWebSocket() {
    socket = new WebSocket("ws://localhost:8000/ws/pedidos/");

    socket.onopen = () => console.log("WebSocket cocina conectado ✓");

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.mensaje) {
            mostrarNotificacion(`⚠ ${data.mensaje.alerta} (Mesa ${data.mensaje.mesa})`);
            reproducirAlerta();
            obtenerPedidos();
        }
    };

    socket.onclose = () => setTimeout(conectarWebSocket, 5000);
    socket.onerror = () => socket.close();
}
