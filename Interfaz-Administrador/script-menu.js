document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("formAgregarPlato");
  const listaPlatos = document.getElementById("listaPlatos");
  const imagenInput = document.getElementById("imagenPlato");
  const previewImagen = document.getElementById("previewImagen");
  const categoriaSelect = document.getElementById("categoriaPlato");

  const API_URL = "http://127.0.0.1:8000/api/productos/";
  const CATEGORIAS_URL = "http://127.0.0.1:8000/api/categorias/";

  // 🔹 Cargar categorías desde el backend
  async function cargarCategorias() {
    try {
      const response = await fetch(CATEGORIAS_URL);
      if (!response.ok) throw new Error("Error al cargar categorías");
      const categorias = await response.json();

      categoriaSelect.innerHTML = '<option value="">Seleccionar categoría</option>';
      categorias.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.nombre;
        categoriaSelect.appendChild(option);
      });
    } catch (error) {
      console.error("⚠️ Error al cargar categorías:", error);
    }
  }

  // 🔹 Vista previa de la imagen seleccionada
  imagenInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    previewImagen.innerHTML = "";
    if (file) {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.classList.add("preview");
      previewImagen.appendChild(img);
    }
  });

  // 🔹 Cargar lista de platos
  async function cargarPlatos() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Error al cargar los platos");
      const platos = await response.json();

      listaPlatos.innerHTML = "";
      platos.forEach(plato => {
        const card = document.createElement("div");
        card.classList.add("plato-card");
        card.innerHTML = `
          <img src="${plato.imagen || 'placeholder.jpg'}" alt="${plato.nombre}">
          <h3>${plato.nombre}</h3>
          <p>${plato.descripcion || "Sin descripción"}</p>
          <p><strong>$${parseFloat(plato.precio).toFixed(2)}</strong></p>
        `;
        listaPlatos.appendChild(card);
      });
    } catch (error) {
      console.error("⚠️ Error al cargar los platos:", error);
    }
  }

  // 🔹 Enviar formulario para agregar un nuevo plato
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombrePlato").value.trim();
    let precio = parseFloat(document.getElementById("precioPlato").value);
    const descripcion = document.getElementById("descripcionPlato").value.trim();
    const categoria = categoriaSelect.value;
    const imagen = imagenInput.files[0];

    if (!nombre || isNaN(precio) || !categoria) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    // 🔸 Redondear el precio a 2 decimales (corrección principal)
    precio = precio.toFixed(2);

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("precio", precio);
    formData.append("descripcion", descripcion);
    formData.append("categoria", categoria);
    if (imagen) formData.append("imagen", imagen);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("⚠️ Error del servidor:", errorText);
        alert("Error del servidor: " + errorText);
        return;
      }

      const data = await response.json();
      console.log("✅ Plato agregado:", data);
      alert("Plato agregado correctamente 🎉");

      form.reset();
      previewImagen.innerHTML = "";
      cargarPlatos();

    } catch (error) {
      console.error("⚠️ Error al guardar el plato:", error);
      alert("Ocurrió un error al guardar el plato.");
    }
  });

  // Inicialización
  cargarCategorias();
  cargarPlatos();
});
