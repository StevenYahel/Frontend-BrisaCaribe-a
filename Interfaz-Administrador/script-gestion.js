document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-mesero');
  const listaMeseros = document.getElementById('lista-meseros');

  async function cargarMeseros() {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/meseros/');
      const meseros = await response.json();

      listaMeseros.innerHTML = '';
      meseros.forEach(m => {
        const li = document.createElement('li');
        li.textContent = `${m.nombre} ${m.apellido} - ${m.documento_identidad}`;
        listaMeseros.appendChild(li);
      });
    } catch (error) {
      console.error('Error al cargar meseros:', error);
    }
  }

  cargarMeseros();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre')?.value.trim();
    const apellido = document.getElementById('apellido')?.value.trim();
    const documento_identidad = document.getElementById('documento_identidad')?.value.trim();
    const telefono = document.getElementById('telefono')?.value.trim();
    const correo = document.getElementById('correo')?.value.trim();
    const direccion = document.getElementById('direccion')?.value.trim();
    const fecha_ingreso = document.getElementById('fecha_ingreso')?.value.trim();

    if (!nombre || !apellido || !documento_identidad) {
      alert('Los campos Nombre, Apellido y Documento son obligatorios');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/meseros/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellido, documento_identidad })
      });

      const data = await response.json();
      console.log('📤 Respuesta del servidor:', data);

      if (!response.ok) throw new Error(`Error del servidor: ${JSON.stringify(data)}`);

      alert('Mesero agregado correctamente');
      form.reset();
      cargarMeseros();
    } catch (error) {
      console.error('⚠️ Error al agregar mesero:', error);
      alert('Error al agregar mesero. Revisa la consola.');
    }
  });
});
