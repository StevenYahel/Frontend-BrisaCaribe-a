document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("usuario").value;
    const password = document.getElementById("contrasena").value;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login-admin/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        //  Guardar sesión local
        localStorage.setItem("adminLogueado", "true");
        localStorage.setItem("usuarioAdmin", username);

        // Redirigir al dashboard
        window.location.href = "dashboard-admin.html";
      } else {
        document.getElementById("error").textContent =
          data.error || "Credenciales incorrectas.";
      }
    } catch (error) {
      console.error("Error:", error);
      document.getElementById("error").textContent =
        "Error de conexión con el servidor.";
    }
  });
});
