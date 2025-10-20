document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

  if (!usuario) {
    window.location.href = "login.html";
    return;
  }

  // Elementos del formulario
  const inputNombre = document.getElementById("nombre");
  const inputCorreo = document.getElementById("correo");
  const inputDireccion = document.getElementById("direccion");
  const inputTelefono = document.getElementById("telefono");

  // Cargar datos existentes (si existen)
  inputNombre.value = usuario.nombre || "";
  inputCorreo.value = usuario.correo || "";
  inputDireccion.value = usuario.direccion || "";
  inputTelefono.value = usuario.telefono || "";

  // Guardar cambios
  const formulario = document.querySelector(".formulario");
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nuevoUsuario = {
      ...usuario,
      nombre: inputNombre.value.trim(),
      correo: inputCorreo.value.trim(),
      direccion: inputDireccion.value.trim(),
      telefono: inputTelefono.value.trim()
    };

    localStorage.setItem("usuarioLogueado", JSON.stringify(nuevoUsuario));
    alert("Perfil actualizado correctamente.");
  });
});
