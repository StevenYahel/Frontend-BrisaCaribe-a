document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim(); // opcional
    const clave = document.getElementById("clave").value.trim();   // opcional
    const confirmar = document.getElementById("confirmar").value.trim();

    if (!nombre || !correo || !clave || !confirmar) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (clave !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/registrar_cliente/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, correo, clave }),
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type");
      let data = {};
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        throw new Error(`Respuesta inesperada del servidor: ${response.status}`);
      }

      if (response.ok) {
        alert(`¡Registro exitoso! Mesa creada: #${data.mesa_numero}`);
        setTimeout(() => {
          window.location.href = "login.html";
        }, 800);
      } else {
        alert(data.message || "Error al registrar el usuario.");
      }

    } catch (error) {
      console.error("Error en la conexión con el servidor:", error);
      alert("No se pudo conectar con el servidor. Revisa que Django esté corriendo y el frontend abierto en un servidor local.");
    }
  });
});
