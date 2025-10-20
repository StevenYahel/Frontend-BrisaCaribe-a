document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formRegistro");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const clave = document.getElementById("clave").value.trim();
    const confirmar = document.getElementById("confirmar").value.trim();

    if (!nombre || !correo || !clave || !confirmar) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    if (clave !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    const yaExiste = usuarios.find((u) => u.correo === correo);
    if (yaExiste) {
      alert("Este correo ya está registrado.");
      return;
    }

    usuarios.push({ nombre, correo, clave });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("¡Registro exitoso! Redirigiendo al login...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 800);
  });
});
