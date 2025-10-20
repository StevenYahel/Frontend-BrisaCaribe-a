document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formAgregarPlato");
  const imagenInput = document.getElementById("imagenPlato");
  const preview = document.getElementById("previewImagen");
  const listaPlatos = document.getElementById("listaPlatos");

  let platos = JSON.parse(localStorage.getItem("menuPlatos")) || [];

  // 🔗 Cargar platos desde el backend Django
  fetch("http://127.0.0.1:8000/api/productos/")
    .then(res => {
      if (!res.ok) throw new Error("Error al obtener platos");
      return res.json();
    })
    .then(data => {
      platos = data; // Sobrescribe con lo que trae el backend
      localStorage.setItem("menuPlatos", JSON.stringify(platos)); // sincroniza en localStorage
      renderPlatos();
    })
    .catch(err => {
      console.error("❌ No se pudo conectar con el servidor:", err);
      renderPlatos(); // Si falla, muestra lo que haya en localStorage
    });

  function renderPlatos() {
    listaPlatos.innerHTML = "";
    if (platos.length === 0) {
      listaPlatos.innerHTML = "<p>No hay platos agregados.</p>";
      return;
    }

    platos.forEach(plato => {
      const div = document.createElement("div");
      div.className = "plato-card";
      div.innerHTML = `
        ${plato.imagen ? `<img src="${plato.imagen}" alt="Foto de ${plato.nombre}" />` : ""}
        <h3>${plato.nombre}</h3>
        <p><strong>Precio:</strong> $${plato.precio}</p>
        <p>${plato.descripcion || ""}</p>
      `;
      listaPlatos.appendChild(div);
    });
  }

  imagenInput.addEventListener("change", function () {
    const file = this.files[0];
    preview.innerHTML = "";

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = document.getElementById("nombrePlato").value.trim();
    const precio = parseFloat(document.getElementById("precioPlato").value);
    const descripcion = document.getElementById("descripcionPlato").value.trim();
    const imagenFile = imagenInput.files[0];

    if (!nombre || isNaN(precio)) return;

    const nuevoPlato = {
      nombre,
      precio,
      descripcion,
      imagen: ""
    };

    if (imagenFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        nuevoPlato.imagen = e.target.result;

        // 🔗 Guardar también en el backend
        fetch("http://127.0.0.1:8000/api/productos/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoPlato)
        })
          .then(res => res.json())
          .then(data => {
            platos.push(data); // Añade el que devuelve el backend
            localStorage.setItem("menuPlatos", JSON.stringify(platos));
            form.reset();
            preview.innerHTML = "";
            renderPlatos();
          })
          .catch(err => console.error("❌ Error al guardar en backend:", err));
      };
      reader.readAsDataURL(imagenFile);
    } else {
      // 🔗 Guardar también en el backend
      fetch("http://127.0.0.1:8000/api/productos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPlato)
      })
        .then(res => res.json())
        .then(data => {
          platos.push(data);
          localStorage.setItem("menuPlatos", JSON.stringify(platos));
          form.reset();
          preview.innerHTML = "";
          renderPlatos();
        })
        .catch(err => console.error("❌ Error al guardar en backend:", err));
    }
  });

  renderPlatos();
});
