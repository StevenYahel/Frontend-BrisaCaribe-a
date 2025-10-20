document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const closeMenu = document.getElementById("closeMenu");
  const navLateral = document.getElementById("navLateral");
  const overlay = document.getElementById("overlay");

  // Asegúrate de que los elementos existen
  if (hamburger && navLateral && overlay && closeMenu) {
    // Mostrar menú lateral
    hamburger.addEventListener("click", () => {
      navLateral.classList.add("show");
      overlay.classList.add("show");
    });

    // Cerrar menú lateral
    closeMenu.addEventListener("click", () => {
      navLateral.classList.remove("show");
      overlay.classList.remove("show");
    });

    overlay.addEventListener("click", () => {
      navLateral.classList.remove("show");
      overlay.classList.remove("show");
    });
  }

  // Cerrar sesión
  const cerrarSesion = document.getElementById("cerrarSesion");
  const cerrarSesionNav = document.getElementById("cerrarSesionNav");
  const cerrarSesionCard = document.getElementById("cerrarSesionCard");

  const cerrarSesionHandler = () => {
    alert("Sesión cerrada correctamente.");
    window.location.href = "index.html"; // Redirige
  };

  if (cerrarSesion) cerrarSesion.addEventListener("click", cerrarSesionHandler);
  if (cerrarSesionNav) cerrarSesionNav.addEventListener("click", cerrarSesionHandler);
  if (cerrarSesionCard) cerrarSesionCard.addEventListener("click", cerrarSesionHandler);
});
