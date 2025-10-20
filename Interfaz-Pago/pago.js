document.addEventListener("DOMContentLoaded", async () => {
  const pedidoSelect = document.getElementById("pedido");
  const metodoSelect = document.getElementById("metodo");
  const montoInput = document.getElementById("monto");
  const btnRegistrar = document.getElementById("registrar");
  const mensaje = document.getElementById("mensaje");

  // 🔹 Cargar pedidos pendientes desde el backend
  try {
    const response = await fetch("http://127.0.0.1:8000/api/pedidos/");
    if (!response.ok) throw new Error("Error al cargar pedidos");
    const pedidos = await response.json();

    console.log("Pedidos obtenidos:", pedidos); // 👀 Revisa si llegan correctamente

    // Filtramos solo los pendientes
    const pendientes = pedidos.filter(p => p.estado === "pendiente");

    if (pendientes.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "No hay pedidos pendientes";
      pedidoSelect.appendChild(opt);
      pedidoSelect.disabled = true;
    } else {
      pendientes.forEach(pedido => {
        const opt = document.createElement("option");
        opt.value = pedido.id;
    opt.textContent = `Pedido #${pedido.id} - Mesa ${pedido.mesa.numero ?? pedido.mesa}`;

        pedidoSelect.appendChild(opt);
      });
    }
  } catch (error) {
    console.error("Error cargando pedidos:", error);
  }

  // 🔹 Registrar pago
  btnRegistrar.addEventListener("click", async () => {
    const pedidoId = pedidoSelect.value;
    const metodo = metodoSelect.value;
    const monto = montoInput.value;

    if (!pedidoId || !monto) {
      mensaje.textContent = "Por favor, completa todos los campos.";
      mensaje.style.color = "red";
      return;
    }

    const data = {
      pedido: pedidoId,
      metodo_pago: metodo,
      monto_pagado: monto
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/pagos/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        mensaje.textContent = "✅ Pago registrado correctamente.";
        mensaje.style.color = "green";

        // Actualizar estado del pedido a "pagado"
        await fetch(`http://127.0.0.1:8000/api/pedidos/${pedidoId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ estado: "pagado" })
        });

        setTimeout(() => location.reload(), 2000);
      } else {
        mensaje.textContent = "❌ Error al registrar el pago.";
        mensaje.style.color = "red";
      }
    } catch (error) {
      console.error("Error enviando pago:", error);
      mensaje.textContent = "⚠️ No se pudo conectar con el servidor.";
      mensaje.style.color = "red";
    }
  });
});
