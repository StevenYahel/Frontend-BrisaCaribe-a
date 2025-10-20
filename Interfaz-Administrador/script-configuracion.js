document.addEventListener("DOMContentLoaded", () => {
  const nombreInput = document.getElementById("nombreRestaurante");
  const passwordInput = document.getElementById("nuevaPassword");
  const logoInput = document.getElementById("logoRestaurante");
  const previewLogo = document.getElementById("previewLogo");

  const API_CONFIG = "http://127.0.0.1:8000/api/configuracion/";

  // 🔹 1. Cargar configuración desde el backend
  fetch(API_CONFIG)
    .then(res => res.json())
    .then(config => {
      if (config.nombre) nombreInput.value = config.nombre;
      if (config.logo) previewLogo.src = config.logo;
    })
    .catch(err => console.error("Error cargando configuración:", err));

  // 🔹 2. Guardar configuración en el backend
  document.getElementById("form-config").addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nombre", nombreInput.value);
    formData.append("password", passwordInput.value);

    if (logoInput.files[0]) {
      formData.append("logo", logoInput.files[0]); // se envía como archivo
    }

    fetch(API_CONFIG, {
      method: "POST", // o PUT si prefieres actualizar
      body: formData
    })
      .then(res => {
        if (!res.ok) throw new Error("Error al guardar configuración");
        return res.json();
      })
      .then(data => {
        alert("Configuración guardada con éxito ✅");
        if (data.logo) previewLogo.src = data.logo;
      })
      .catch(err => {
        console.error("Error guardando configuración:", err);
      });
  });
});

// 🔹 3. Vista previa del logo cargado
document.getElementById("input-logo").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("logo-preview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});
