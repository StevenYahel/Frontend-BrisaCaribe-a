document.getElementById('btn-respaldar').addEventListener('click', () => {
  // 🔗 Consultar datos reales desde el backend Django
  Promise.all([
    fetch("http://127.0.0.1:8000/api/productos/").then(res => res.json()),
    fetch("http://127.0.0.1:8000/api/pedidos/").then(res => res.json()),
    fetch("http://127.0.0.1:8000/api/meseros/").then(res => res.json())
  ])
    .then(([menu, pedidos, meseros]) => {
      const respaldo = { menu, pedidos, meseros };

      // Generar archivo JSON para descarga
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(respaldo, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "respaldo_brisa.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    })
    .catch(err => {
      console.error("❌ Error al generar respaldo:", err);
      alert("Error al generar el respaldo. Verifica la conexión con el servidor.");
    });
});

document.querySelector(".btn").addEventListener("click", () => {
  const mensaje = document.querySelector(".message.success");
  mensaje.style.display = "block";
 
  setTimeout(() => {
    mensaje.style.display = "none";
  }, 3000);
});
