document.addEventListener("DOMContentLoaded", () => {
  const nombreInput = document.getElementById("nombreRestaurante");
  const passwordInput = document.getElementById("nuevaPassword");
  const logoInput = document.getElementById("logoRestaurante");
  const previewLogo = document.getElementById("previewLogo");

  // Cargar configuración previa si existe (localStorage)
  const config = JSON.parse(localStorage.getItem("configuracion")) || {};

  if (config.nombre) nombreInput.value = config.nombre;
  if (config.logo) previewLogo.src = config.logo;

  document.getElementById("form-config").addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevaConfig = {
      nombre: nombreInput.value,
      password: passwordInput.value || config.password,
      logo: config.logo // se actualizará si se carga nueva imagen
    };

    if (logoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        nuevaConfig.logo = reader.result;
        guardar(nuevaConfig);
      };
      reader.readAsDataURL(logoInput.files[0]);
    } else {
      guardar(nuevaConfig);
    }
  });

  function guardar(configData) {
    // Guardar localmente
    localStorage.setItem("configuracion", JSON.stringify(configData));
    alert("Configuración guardada con éxito.");
    if (configData.logo) previewLogo.src = configData.logo;

    // 🔗 Enviar al backend Django
    fetch("http://127.0.0.1:8000/api/configuracion/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la conexión con el servidor");
        return res.json();
      })
      .then((data) => {
        console.log("✅ Configuración guardada en el servidor:", data);
      })
      .catch((err) => {
        console.error("❌ Error enviando configuración:", err);
      });
  }
});

// Vista previa del logo cargado
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
