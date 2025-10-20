// script-cocina.js

const listaPedidos = document.getElementById('listaPedidos');
const notificacion = document.getElementById('notificacion');
const cerrarSesionBtn = document.getElementById('cerrarSesion');

// Función para obtener pedidos desde la API
async function cargarPedidos() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/pedidos/');
    if (!res.ok) throw new Error('Error al obtener pedidos');
    const pedidos = await res.json();

    renderPedidos(pedidos);
  } catch (error) {
    console.error('Error cargando pedidos:', error);
  }
}

// Función para renderizar los pedidos en la cocina
function renderPedidos(pedidos) {
  listaPedidos.innerHTML = '';

  pedidos.forEach(pedido => {
    // Solo mostrar pedidos que no estén servidos
    if (pedido.estado !== 'servido' && pedido.estado !== 'pagado') {
      const li = document.createElement('li');
      li.className = 'pedido-card';

      const productos = pedido.detalles.length
        ? pedido.detalles.map(d => `${d.cantidad} x ${d.producto.nombre}`).join(', ')
        : 'Sin detalles aún';

      li.innerHTML = `
        <h3>Pedido #${pedido.id} - Mesa ${pedido.mesa}</h3>
        <p><strong>Productos:</strong> ${productos}</p>
        <div class="estado">
          <label>Estado:</label>
          <select data-id="${pedido.id}">
            <option value="pendiente" ${pedido.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en_preparacion" ${pedido.estado === 'en_preparacion' ? 'selected' : ''}>En preparación</option>
            <option value="servido" ${pedido.estado === 'servido' ? 'selected' : ''}>Servido</option>
          </select>
        </div>
      `;

      listaPedidos.appendChild(li);
    }
  });

  // Agregar listener a los selects
  document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const pedidoId = e.target.dataset.id;
      const nuevoEstado = e.target.value;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ estado: nuevoEstado })
        });
        if (!res.ok) throw new Error('No se pudo actualizar el estado');
        cargarPedidos(); // refresca la lista
      } catch (error) {
        console.error('Error actualizando pedido:', error);
      }
    });
  });
}

// Simular notificación de pedido nuevo
function mostrarNotificacion() {
  if (!notificacion) return;
  notificacion.style.display = 'block';
  setTimeout(() => {
    notificacion.style.display = 'none';
  }, 2500);
}

// Cerrar sesión
if (cerrarSesionBtn) {
  cerrarSesionBtn.addEventListener('click', () => {
    alert("Sesión cerrada");
    location.href = 'login.html';
  });
}

// Inicializar
cargarPedidos();

// Opcional: refrescar pedidos cada 15s
setInterval(cargarPedidos, 15000);
