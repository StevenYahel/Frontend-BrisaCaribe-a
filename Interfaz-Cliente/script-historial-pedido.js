document.addEventListener('DOMContentLoaded', () => {
    const contenedor = document.getElementById('contenedorHistorial');
    const filtroFecha = document.getElementById('filtroFecha');
    const filtroPlato = document.getElementById('filtroPlato');
    const btnLimpiar = document.getElementById('limpiarFiltros');
    const sinDatos = document.getElementById('sinDatos');
    const spinner = document.getElementById('spinner');

    // ===============================
    // CARGAR HISTORIAL DE PEDIDOS
    // ===============================
    async function cargarHistorial() {
        if (spinner) spinner.style.display = 'block';
        if (contenedor) contenedor.innerHTML = '';
        if (sinDatos) sinDatos.style.display = 'none';

        try {
            // 🛑 LÍNEA CORREGIDA: Cambiado 'pedidos_cliente' por 'pedidos/cliente/' para coincidir con Django.
            const response = await fetch('http://127.0.0.1:8000/api/pedidos/cliente/', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include' // <- MUY IMPORTANTE para usar la sesión
            });

            if (!response.ok) {
                if (response.status === 401) {
                    if (sinDatos) {
                        sinDatos.style.display = 'block';
                        sinDatos.textContent = 'No hay sesión activa. Por favor inicia sesión.';
                    }
                    return;
                }
                throw new Error('Error al obtener los pedidos');
            }

            const pedidos = await response.json();

            if (spinner) spinner.style.display = 'none';

            if (!pedidos.length) {
                if (sinDatos) sinDatos.style.display = 'block';
                return;
            }

            // Ordenar por fecha descendente
            pedidos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // Aplicar filtros
            const fechaFiltro = filtroFecha.value;
            const platoFiltro = filtroPlato.value.toLowerCase();

            const pedidosFiltrados = pedidos.filter(pedido => {
                const fechaMatch = fechaFiltro ? pedido.fecha.startsWith(fechaFiltro) : true;
                const platoMatch = platoFiltro
                    ? pedido.detalles.some(d => d.producto_nombre.toLowerCase().includes(platoFiltro))
                    : true;
                return fechaMatch && platoMatch;
            });

            if (!pedidosFiltrados.length) {
                if (sinDatos) sinDatos.style.display = 'block';
                return;
            }

            // Mostrar pedidos en cards
            pedidosFiltrados.forEach(pedido => {
                const card = document.createElement('div');
                card.className = 'pedido-card';

                const header = document.createElement('div');
                header.className = 'pedido-header';
                header.innerHTML = `
                    <div>Mesa: ${pedido.mesa} | Total: $${pedido.total}</div>
                    <div class="estado ${pedido.estado}">${pedido.estado}</div>
                `;
                
                // 🛑 CÓDIGO DE FECHA ELIMINADO

                const detalles = document.createElement('div');
                detalles.className = 'detalles';
                let detallesHTML = '<ul>';
                pedido.detalles.forEach(d => {
                    detallesHTML += `<li>${d.producto_nombre} x${d.cantidad} - $${d.subtotal}</li>`;
                });
                detallesHTML += '</ul>';
                detalles.innerHTML = detallesHTML;
                detalles.style.display = 'none'; // oculto por defecto

                header.addEventListener('click', () => {
                    detalles.style.display = detalles.style.display === 'block' ? 'none' : 'block';
                });

                card.appendChild(header);
                // 🛑 SE ELIMINÓ card.appendChild(fecha);
                card.appendChild(detalles);

                if (contenedor) contenedor.appendChild(card);
            });

        } catch (error) {
            if (spinner) spinner.style.display = 'none';
            console.error(error);
            if (sinDatos) {
                sinDatos.style.display = 'block';
                sinDatos.textContent = 'Error al cargar los pedidos.';
            }
        }
    }

    // ===============================
    // EVENTOS DE FILTROS
    // ===============================
    if (filtroFecha) filtroFecha.addEventListener('change', cargarHistorial);
    if (filtroPlato) filtroPlato.addEventListener('input', cargarHistorial);
    if (btnLimpiar) btnLimpiar.addEventListener('click', () => {
        if (filtroFecha) filtroFecha.value = '';
        if (filtroPlato) filtroPlato.value = '';
        cargarHistorial();
    });

    // ===============================
    // Cargar historial automáticamente
    // ===============================
    cargarHistorial();
});