document.addEventListener("DOMContentLoaded", () => {
    const API = "http://127.0.0.1:8000/api/";

    const meseroSelect = document.getElementById("meseroSelect");
    const mesaSelect = document.getElementById("mesaSelect");
    const productosSelect = document.getElementById("productosSelect");
    const cantidadProducto = document.getElementById("cantidadProducto");
    const btnAgregarProducto = document.getElementById("btnAgregarProducto");
    const listaProductos = document.getElementById("listaProductos");
    const btnRegistrar = document.getElementById("btnRegistrarPedido");
    const pedidosCocina = document.getElementById("pedidosCocina");

    let carrito = [];

    async function cargarMeseros() {
        try {
            const res = await fetch(API + "meseros/");
            const data = await res.json();
            meseroSelect.innerHTML = "<option value=''>Seleccione mesero</option>";
            data.forEach(m => {
                meseroSelect.innerHTML += `<option value="${m.id}">${m.nombre}</option>`;
            });
        } catch (err) {
            console.error("Error cargando meseros:", err);
        }
    }

    async function cargarMesas() {
        try {
            const res = await fetch(API + "mesas/disponibles/");
            const data = await res.json();
            mesaSelect.innerHTML = "<option value=''>Seleccione una mesa</option>";
            data.forEach(m => {
                mesaSelect.innerHTML += `<option value="${m.id}">Mesa ${m.numero}</option>`;
            });
        } catch (err) {
            console.error("Error cargando mesas:", err);
        }
    }

    async function cargarProductos() {
        try {
            const res = await fetch(API + "productos/");
            const data = await res.json();
            productosSelect.innerHTML = "<option value=''>Seleccione un producto</option>";
            data.forEach(p => {
                productosSelect.innerHTML += `<option value="${p.id}">${p.nombre} - $${p.precio}</option>`;
            });
        } catch (err) {
            console.error("Error cargando productos:", err);
        }
    }

    btnAgregarProducto.addEventListener("click", () => {
        const productoId = productosSelect.value;
        const productoNombre = productosSelect.options[productosSelect.selectedIndex].text;
        const cantidad = parseInt(cantidadProducto.value);

        if (!productoId || cantidad < 1) {
            alert("Seleccione un producto y una cantidad válida.");
            return;
        }

        carrito.push({ producto_id: parseInt(productoId), producto_nombre: productoNombre, cantidad });
        renderCarrito();
    });

    function renderCarrito() {
        listaProductos.innerHTML = "";
        carrito.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "producto-item";
            li.innerHTML = `
                <span>${item.producto_nombre} x ${item.cantidad}</span>
                <button class="eliminar" data-index="${index}">&times;</button>
            `;
            listaProductos.appendChild(li);
        });

        document.querySelectorAll(".eliminar").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const idx = e.target.dataset.index;
                carrito.splice(idx, 1);
                renderCarrito();
            });
        });
    }

    btnRegistrar.addEventListener("click", async () => {
        const mesero = meseroSelect.value;
        const mesa = mesaSelect.value;

        if (!mesero || !mesa || carrito.length === 0) {
            alert("Debe seleccionar mesero, mesa y agregar al menos un producto.");
            return;
        }

        const pedidoData = {
            mesa_id: parseInt(mesa),
            mesero_id: parseInt(mesero),
            productos: carrito.map(p => ({
                producto_id: p.producto_id,
                cantidad: p.cantidad
            }))
        };

        try {
            const res = await fetch(API + "pedidos/crear/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pedidoData)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error("Error backend: " + JSON.stringify(errorData));
            }

            const data = await res.json();
            alert("Pedido registrado correctamente");
            carrito = [];
            renderCarrito();
            cargarPedidosCocina();

        } catch (err) {
            console.error(err);
            alert("Ocurrió un error al registrar el pedido. Revisa la consola.");
        }
    });

    async function cargarPedidosCocina() {
        try {
            const res = await fetch(API + "pedidos-cocina/");
            const data = await res.json();
            pedidosCocina.innerHTML = "";

            if (data.length === 0) {
                pedidosCocina.innerHTML = "<p>No hay pedidos en cocina</p>";
                return;
            }

            data.forEach(pedido => {
                const div = document.createElement("div");
                div.className = "pedido-card";

                div.innerHTML = `
                    <h3>Pedido #${pedido.id}</h3>
                    <p><strong>Mesa:</strong> ${pedido.mesa}</p>
                    <p><strong>Mesero:</strong> ${pedido.mesero}</p>
                    <p><strong>Estado:</strong> ${pedido.estado}</p>
                    <p><strong>Productos:</strong></p>
                    <ul>
                        ${pedido.detalles.map(d => `<li>${d.producto_nombre} x ${d.cantidad}</li>`).join("")}
                    </ul>
                `;

                pedidosCocina.appendChild(div);
            });

        } catch (err) {
            console.error("Error cargando pedidos cocina:", err);
        }
    }

    async function actualizarEstadoPedido(pedidoId, nuevoEstado) {
        try {
            const res = await fetch(`${API}pedidos/${pedidoId}/actualizar/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error("Error backend: " + JSON.stringify(errorData));
            }

            const data = await res.json();
            console.log(`Pedido ${pedidoId} actualizado a ${nuevoEstado}`, data);
            cargarPedidosCocina();

        } catch (err) {
            console.error("Error actualizando estado de pedido:", err);
        }
    }

    function agregarBotonesServido() {
        const pedidos = document.querySelectorAll(".pedido-card");
        pedidos.forEach(div => {
            if (!div.querySelector(".btn-servido")) {
                const btn = document.createElement("button");
                btn.textContent = "Marcar como servido";
                btn.className = "btn-servido";
                const pedidoId = div.querySelector("h3").textContent.split("#")[1];
                btn.addEventListener("click", () => actualizarEstadoPedido(pedidoId, "servido"));
                div.appendChild(btn);
            }
        });
    }

    async function verificarRetrasos() {
        try {
            const res = await fetch(API + "verificar-retrasos/");
            if (!res.ok) return;
            const data = await res.json();

            if (data.alertas.length > 0) {
                data.alertas.forEach(a => {
                    mostrarAlertaRetraso(a.id);
                });
            }
        } catch (err) {
            console.error("Error al verificar retrasos:", err);
        }
    }

    function mostrarAlertaRetraso(idPedido) {
        const alerta = document.createElement("div");
        alerta.className = "alerta-retraso";
        alerta.innerHTML = `⚠ Pedido #${idPedido} está retrasado`;

        document.body.appendChild(alerta);

        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }

    cargarMeseros();
    cargarMesas();
    cargarProductos();
    cargarPedidosCocina();

    setInterval(cargarPedidosCocina, 10000);
    setInterval(agregarBotonesServido, 10000);
    setInterval(verificarRetrasos, 15000);
});
