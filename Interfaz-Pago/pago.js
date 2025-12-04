document.addEventListener("DOMContentLoaded", async () => {
  const pedidoSelect = document.getElementById("pedido");
  const metodoSelect = document.getElementById("metodo");
  const montoInput = document.getElementById("monto");
  const btnRegistrar = document.getElementById("registrar");
  const btnRecibo = document.getElementById("recibo");
  const mensaje = document.getElementById("mensaje");

  let pedidosPendientes = [];
  let ultimoPago = null;

  const mostrarMensaje = (texto, tipo) => {
    mensaje.textContent = texto;
    mensaje.style.color = tipo === "success" ? "green" : tipo === "error" ? "red" : "orange";
    mensaje.classList.add("fade");
    setTimeout(() => mensaje.classList.remove("fade"), 3000);
  };

  const renderPedidos = () => {
    pedidoSelect.innerHTML = "";
    if (pedidosPendientes.length === 0) {
      const opt = document.createElement("option");
      opt.textContent = "No hay pedidos disponibles para pago";
      pedidoSelect.appendChild(opt);
      pedidoSelect.disabled = true;
      montoInput.value = "";
      metodoSelect.value = "";
    } else {
      pedidosPendientes.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `Pedido #${p.id} - Mesa ${p.mesa.numero ?? p.mesa} (${p.estado})`;
        pedidoSelect.appendChild(opt);
      });
      pedidoSelect.disabled = false;
    }
  };

  const cargarPedidos = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/pedidos/");
      if (!res.ok) throw new Error("Error al cargar pedidos");
      const pedidos = await res.json();
      pedidosPendientes = pedidos.filter(p => p.estado !== "pagado");
      renderPedidos();
    } catch (e) {
      console.error(e);
      mostrarMensaje("⚠️ No se pudieron cargar los pedidos.", "warning");
    }
  };

  await cargarPedidos();

  let ws;
  const conectarWebSocket = () => {
    ws = new WebSocket("ws://127.0.0.1:8000/ws/pedidos/");
    ws.onopen = () => console.log("✅ WS conectado");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      pedidosPendientes = pedidosPendientes.map(p =>
        p.id === data.pedido_id ? {...p, estado: data.estado} : p
      ).filter(p => p.estado !== "pagado");
      renderPedidos();
    };
    ws.onclose = () => {
      console.warn("⚠️ WS cerrado, reconectando en 3s...");
      setTimeout(conectarWebSocket, 3000);
    };
    ws.onerror = (err) => console.error("WS error:", err);
  };
  conectarWebSocket();

  btnRegistrar.addEventListener("click", async () => {
    const pedidoId = pedidoSelect.value;
    const metodo = metodoSelect.value;
    const monto = parseFloat(montoInput.value);

    if (!pedidoId || !monto) {
      mostrarMensaje("Por favor, completa todos los campos.", "error");
      return;
    }

    const data = { pedido_id: pedidoId, metodo_pago: metodo, monto_pagado: monto };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/pagos/registrar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (res.ok) {
        mostrarMensaje("✅ Pago registrado correctamente.", "success");
        ultimoPago = { pedido_id: pedidoId, metodo_pago: metodo, monto_pagado: monto };
        pedidosPendientes = pedidosPendientes.filter(p => p.id != pedidoId);
        renderPedidos();
        montoInput.value = "";
        metodoSelect.value = "";
      } else {
        mostrarMensaje(`❌ ${result.error || result.mensaje}`, "error");
      }
    } catch (e) {
      console.error(e);
      mostrarMensaje("⚠️ No se pudo conectar con el servidor.", "error");
    }
  });

  // 🔹 Recibo compacto estilo ticket
  btnRecibo.addEventListener("click", async () => {
    if (!ultimoPago) return mostrarMensaje("No hay pago para generar recibo.", "warning");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/pedidos/${ultimoPago.pedido_id}/`);
      if (!res.ok) throw new Error("No se pudo obtener el pedido");
      const pedido = await res.json();

      const fecha = new Date();
      const fechaStr = fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

      // Formato ticket compacto
      const contenido = `
==============================
       RESTAURANTE
==============================
Pedido: #${pedido.id}
Mesa: ${pedido.mesa?.numero ?? pedido.mesa}
Fecha: ${fechaStr}
------------------------------
Total: $${ultimoPago.monto_pagado}
Método de pago: ${ultimoPago.metodo_pago}
------------------------------
¡Gracias por su compra!
==============================
`;

      const ventana = window.open("", "_blank");
      ventana.document.write(`<pre style="font-family: monospace; font-size: 12px;">${contenido}</pre>`);
      ventana.document.close();
      ventana.print();

    } catch (e) {
      console.error(e);
      mostrarMensaje("⚠️ No se pudo generar el recibo.", "error");
    }
  });
});
