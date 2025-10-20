document.addEventListener('DOMContentLoaded', () => {
  const tablaPedidos = document.getElementById('tablaPedidos');
  const btnVolver = document.getElementById('btnVolver');

  const pedidosHistorial = [
    {
      id: 101,
      fecha: '2025-07-29',
      origen: 'Mesero',
      estado: 'Completado',
      productos: ['Arroz con coco', 'Pescado frito']
    },
    {
      id: 102,
      fecha: '2025-07-30',
      origen: 'Cliente Online',
      estado: 'Cancelado',
      productos: ['Ceviche mixto', 'Limonada de coco']
    },
    {
      id: 103,
      fecha: '2025-07-30',
      origen: 'Mesero',
      estado: 'Completado',
      productos: ['Arepa de huevo', 'Jugo de tamarindo']
    }
  ];

  // Mostrar en la tabla
  pedidosHistorial.forEach(pedido => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.fecha}</td>
      <td>${pedido.origen}</td>
      <td>${pedido.estado}</td>
      <td><button class="ver-detalles" onclick='mostrarDetalles(${JSON.stringify(pedido)})'>Ver detalles</button></td>
    `;
    tablaPedidos.appendChild(fila);
  });

  // Botón volver al panel
  btnVolver.addEventListener('click', () => {
    window.location.href = 'cocina.html'; 
  });
});

// Mostrar detalles del pedido
function mostrarDetalles(pedido) {
  alert(
    `Detalles del Pedido #${pedido.id}\n\nOrigen: ${pedido.origen}\nEstado: ${pedido.estado}\nFecha: ${pedido.fecha}\n\nProductos:\n- ${pedido.productos.join('\n- ')}`
  );
}
