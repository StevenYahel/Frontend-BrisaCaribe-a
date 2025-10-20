document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const error = document.getElementById("error");

  fetch("http://127.0.0.1:8000/api/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username: usuario, password: contrasena })
  })
    .then(res => {
      if (!res.ok) throw new Error("Credenciales inválidas");
      return res.json();
    })
    .then(data => {
      if (data.success) {
        // Guardamos en localStorage que el admin está logueado
        localStorage.setItem("adminLogueado", "true");
        window.location.href = "dashboard-admin.html"; // Redirige al panel
      } else {
        error.textContent = data.message || "Usuario o contraseña incorrectos.";
      }
    })
    .catch(err => {
      console.error(err);
      error.textContent = "Error al intentar iniciar sesión.";
    });
});
