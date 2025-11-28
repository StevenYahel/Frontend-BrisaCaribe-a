document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formLogin");

  if (!form) {
    console.error("No se encontró el formulario de login.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const mesaInput = document.getElementById("mesa_id");
    if (!mesaInput) {
      alert("No se encontró el campo de número de mesa.");
      return;
    }

    const mesaId = mesaInput.value.trim();
    if (!mesaId) {
      alert("Por favor, ingresa el número de mesa.");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login_cliente/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesa_id: mesaId }),
        credentials: "include"
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Respuesta no es JSON:", text);
        alert("Error: el servidor respondió con algo inesperado.");
        return;
      }

      if (res.ok && data.success) {


        localStorage.setItem("mesa_id", mesaId);
        localStorage.setItem("mesa_numero", data.mesa_numero); 
        

        alert(`Mesa ${data.mesa_numero} iniciada. Redirigiendo al dashboard...`);
        window.location.href = "dashboard-cliente.html";

      } else {
        alert(data.message || "Error al iniciar sesión.");
      }

    } catch (error) {
      console.error("Error de conexión con el servidor:", error);
      alert("No se pudo conectar con el servidor.");
    }
  });
});
