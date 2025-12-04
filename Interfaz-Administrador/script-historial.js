document.addEventListener("DOMContentLoaded", () => {

    // 📄 Referencias a elementos del DOM
    const contenedor = document.getElementById("historial-pedidos");
    const filtroMesero = document.getElementById("filtroMesero");
    const filtroMesa = document.getElementById("filtroMesa");
    const filtroFecha = document.getElementById("filtroFecha");
    const btnLimpiar = document.getElementById("limpiarFiltros");

    // 💾 Almacén de pedidos completos (se inicializa con respaldo local)
    // 🟢 MEJORA: Declarar con 'let' fuera del bloque para mejor alcance si es necesario
    let pedidosCompletos = JSON.parse(localStorage.getItem("pedidos_completo")) || []; 
    let pedidosMostrados = []; // Almacena la lista filtrada actualmente

    // --- CARGA DE DATOS DESDE EL BACKEND Y NORMALIZACIÓN ---
    fetch("http://127.0.0.1:8000/api/pedidos/")
        .then(res => {
            if (!res.ok) {
                console.error(`Error HTTP: Status ${res.status}`);
                // 🟢 MEJORA: Usar Promise.reject para un manejo de errores más claro
                return Promise.reject(new Error("Error al obtener pedidos del servidor"));
            }
            return res.json();
        })
        .then(data => {
            // console.log("Pedidos recibidos del backend (JSON original):", data);

            // 🟢 CLAVE: Mapear y normalizar los datos de Django
            pedidosCompletos = data.map(pedido => {
                const detalles = Array.isArray(pedido.detalles) ? pedido.detalles : [];
                
                // Mapear detalles al formato 'platos' esperado por el frontend
                const platosNormalizados = detalles.map(detalle => ({
                    nombre: detalle.producto_nombre,
                    // Multiplicamos por cantidad para obtener el precio total del ítem.
                    precio: parseFloat(detalle.precio_unitario) * (detalle.cantidad || 1) 
                }));
                
                return {
                    ...pedido,
                    platos: platosNormalizados,
                };
            });

            // console.log("Pedidos después de la normalización (Estructura final):", pedidosCompletos);
            
            localStorage.setItem("pedidos_completo", JSON.stringify(pedidosCompletos));
            // 🟢 MEJORA: Asignar el resultado inicial a la lista mostrada
            pedidosMostrados = [...pedidosCompletos]; 
            mostrarPedidos(pedidosMostrados);
        })
        .catch(err => {
            console.error("❌ No se pudo conectar con el servidor. Mostrando datos locales:", err);
            // Si falla la conexión, mostramos el respaldo local
            pedidosMostrados = [...pedidosCompletos]; 
            mostrarPedidos(pedidosMostrados);
        });

    // --- FUNCIÓN PARA MOSTRAR PEDIDOS ---
    function mostrarPedidos(lista) {
        contenedor.innerHTML = "";

        if (lista.length === 0) {
            // 🟢 MEJORA: Usar clase definida en CSS para mensaje vacío
            contenedor.innerHTML = `<p class='mensaje-vacio'>
                                        <i class="fas fa-search"></i> No hay pedidos registrados que coincidan con los filtros.
                                    </p>`;
            return;
        }

        // Ordenar por fecha descendente
        lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        lista.forEach(pedido => {
            const div = document.createElement("div");
            div.className = "pedido";

            // Aseguramos que platos sea un array y calculamos el total
            const platos = Array.isArray(pedido.platos) ? pedido.platos : [];
            const total = platos.reduce((sum, p) => sum + (p.precio || 0), 0);
            
            // 🟢 MEJORA: Formatear fecha para display si existe
            const fechaDisplay = pedido.fecha 
                ? new Date(pedido.fecha).toLocaleDateString('es-ES', { 
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  }) 
                : "Fecha N/A";

            // Usamos 'mesero' o un valor por defecto si es 'online'
            const meseroDisplay = pedido.mesero || (pedido.cliente === "online" ? "Online" : "Sin asignar");

            // Render del HTML de la tarjeta
            div.innerHTML = `
                <p class="mesero-info">Mesero: ${meseroDisplay}</p>
                <p><strong>Mesa:</strong> ${pedido.mesa || "N/A"}</p>
                <p><strong>Fecha:</strong> ${fechaDisplay}</p> <div class="detalles-platos">
                    <ul>
                        ${
                            // Muestra la lista de platos o un mensaje
                            platos.length > 0 
                            ? platos.map(p => `<li><span>${p.nombre || 'Plato N/A'}</span> <span>$${(p.precio || 0).toLocaleString('es-ES')}</span></li>`).join("")
                            : '<li>Sin platos registrados.</li>'
                        }
                    </ul>
                </div>

                <p class="total"><strong>Total:</strong> $${total.toLocaleString('es-ES')}</p>
                
                <button class="btn-imprimir"> 
                    <i class="fas fa-print"></i> Imprimir Recibo
                </button>
            `;

            contenedor.appendChild(div);

            // 🟢 CLAVE: Adjuntar el objeto 'pedido' directamente al botón
            const botonImprimir = div.querySelector(".btn-imprimir");
            botonImprimir.pedidoData = pedido; 
            
            // Asignar el evento click
            botonImprimir.addEventListener("click", function() {
                imprimirPedido(this.pedidoData); 
            });
        });
    }


    // --- LÓGICA DE FILTRADO ---
    function aplicarFiltros() {
        const meseroFiltro = filtroMesero.value.trim().toLowerCase();
        const mesaFiltro = filtroMesa.value.trim();
        const fechaFiltro = filtroFecha.value;

        const filtrados = pedidosCompletos.filter(pedido => {
            const meseroPedido = pedido.mesero ? pedido.mesero.toLowerCase() : (pedido.cliente === "online" ? "online" : "");

            const coincideMesero = !meseroFiltro || meseroPedido.includes(meseroFiltro);
            const coincideMesa = !mesaFiltro || (pedido.mesa && pedido.mesa.toString().includes(mesaFiltro));

            let coincideFecha = true;
            if (fechaFiltro && pedido.fecha) {
                // Comparamos solo la parte YYYY-MM-DD
                const fechaPedidoISO = new Date(pedido.fecha).toISOString().split("T")[0];
                coincideFecha = fechaFiltro === fechaPedidoISO;
            } else if (fechaFiltro && !pedido.fecha) {
                coincideFecha = false;
            }

            return coincideMesero && coincideMesa && coincideFecha;
        });

        pedidosMostrados = filtrados;
        mostrarPedidos(pedidosMostrados);
    }

    filtroMesero.addEventListener("input", aplicarFiltros);
    filtroMesa.addEventListener("input", aplicarFiltros);
    filtroFecha.addEventListener("change", aplicarFiltros);

    btnLimpiar.addEventListener("click", () => {
        filtroMesero.value = "";
        filtroMesa.value = "";
        filtroFecha.value = "";
        pedidosMostrados = [...pedidosCompletos];
        mostrarPedidos(pedidosMostrados);
    });

    // La carga inicial se hace al final del fetch, pero si el localstorage tiene datos, 
    // se llama aquí para mostrar el caché mientras se espera la API.
    if (pedidosCompletos.length > 0) {
        mostrarPedidos(pedidosCompletos);
    }
});


/// --- FUNCIÓN DE IMPRESIÓN (GLOBAL) - CON FECHA AÑADIDA ---
function imprimirPedido(pedido) {
    const ventana = window.open("", "_blank");

    if (!ventana) {
        alert("El navegador bloqueó la ventana de impresión. Por favor, permite las ventanas emergentes para este sitio.");
        return; 
    }

    // 2. Calcular datos para impresión
    const platos = Array.isArray(pedido.platos) ? pedido.platos : [];
    const total = platos.reduce((sum, p) => sum + (p.precio || 0), 0);
    const meseroDisplay = pedido.mesero || (pedido.cliente === "online" ? "Online" : "Sin asignar");

    // 🟢 MEJORA: Formatear la fecha para la impresión
    const fechaRecibo = pedido.fecha 
        ? new Date(pedido.fecha).toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
          }) 
        : new Date().toLocaleString('es-ES');

    // 3. Escribir contenido en la nueva ventana
    ventana.document.write(`
        <html>
        <head>
            <title>Recibo de Pedido ${pedido.id || ""}</title>
            <style>
                body { 
                    font-family: 'Courier New', Courier, monospace; 
                    padding: 1rem; 
                    width: 300px; /* Ancho de ticket de caja */
                    margin: auto;
                    font-size: 12px;
                }
                h3 { text-align: center; margin-bottom: 5px; }
                h4 { border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; }
                .linea { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .total { font-weight: bold; font-size: 1.1em; border-top: 2px dashed #000; padding-top: 5px; margin-top: 10px; }
                .meta-data { margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            </style>
        </head>
        <body>
            <h3>BRISA CARIBEÑA</h3>
            <div class="meta-data">
                <div class="linea"><span>Fecha:</span> <span>${fechaRecibo}</span></div>
                <div class="linea"><span>Pedido ID:</span> <span>${pedido.id || "N/A"}</span></div>
                <div class="linea"><span>Mesero:</span> <span>${meseroDisplay}</span></div>
                <div class="linea"><span>Mesa:</span> <span>${pedido.mesa || "N/A"}</span></div>
            </div>
            
            <h4>DETALLES DEL CONSUMO</h4>
            ${platos.map(p => `
                <div class="linea">
                    <span>${p.nombre}</span>
                    <span>$${(p.precio || 0).toLocaleString('es-ES')}</span>
                </div>
            `).join("")}

            <div class="total linea">
                <span>TOTAL A PAGAR:</span>
                <span>$${total.toLocaleString('es-ES')}</span>
            </div>

            <p style="text-align: center; margin-top: 20px;">
                * GRACIAS POR SU VISITA *
            </p>

            <script>window.print();</script>
        </body>
        </html>
    `);

    ventana.document.close();
}