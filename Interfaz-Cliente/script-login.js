document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const clave = document.getElementById("clave").value.trim();

    if (!correo || !clave) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const usuario = usuarios.find((u) => u.correo === correo && u.clave === clave);

    if (!usuario) {
      alert("Usuario o contraseña incorrectos.");
      return;
    }

    // Guardar sesión
    localStorage.setItem("usuarioLogueado", JSON.stringify(usuario));

    alert("Inicio de sesión exitoso. Redirigiendo...");
    setTimeout(() => {
      window.location.href = "dashboard-cliente.html";
    }, 500);
  });
});
