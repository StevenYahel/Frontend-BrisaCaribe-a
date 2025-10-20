document.addEventListener("DOMContentLoaded", () => {
  const API_PEDIDOS = "http://127.0.0.1:8000/api/pedidos/";

  const botonesAgregar = document.querySelectorAll(".agregar");
  const carrito = document.getElementById("carritoPedido");
  const listaPedidos = document.getElementById("listaPedidos");
  const inputMesero = document.getElementById("nombreMesero");
  const inputMesa = document.getElementById("numeroMesa");
  const inputComentario = document.getElementById("comentario");
  const btnEnviar = document.getElementById("enviarPedido");
  const btnCancelar = document.getElementById("cancelarPedido");

  let pedidoActual = [];

  function actualizarCarrito() {
    listaPedidos.innerHTML = "";

    if (pedidoActual.length === 0) {
      carrito.classList.add("oculto");
      return;
    }

    carrito.classList.remove("oculto");

    pedidoActual.forEach((plato, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${plato.nombre} - $${plato.precio.toLocaleString()}
        <button data-index="${index}" class="eliminar">🗑️</button>
      `;
      listaPedidos.appendChild(li);
    });

    const total = pedidoActual.reduce((sum, p) => sum + p.precio, 0);
    const totalLi = document.createElement("li");
    totalLi.innerHTML = `<strong>Total: $${total.toLocaleString()}</strong>`;
    listaPedidos.appendChild(totalLi);
  }

  botonesAgregar.forEach(btn => {
    btn.addEventListener("click", () => {
      const nombre = btn.dataset.nombre;
      const precio = parseInt(btn.dataset.precio);
      pedidoActual.push({ nombre, precio });
      actualizarCarrito();
    });
  });

  listaPedidos.addEventListener("click", e => {
    if (e.target.classList.contains("eliminar")) {
      const index = parseInt(e.target.dataset.index);
      pedidoActual.splice(index, 1);
      actualizarCarrito();
    }
  });

  btnCancelar.addEventListener("click", () => {
    pedidoActual = [];
    inputMesero.value = "";
    inputMesa.value = "";
    inputComentario.value = "";
    actualizarCarrito();
  });

  btnEnviar.addEventListener("click", async () => {
    const mesero = inputMesero.value.trim();
    const mesa = inputMesa.value.trim();

    if (!mesero || !mesa || pedidoActual.length === 0) {
      alert("Por favor, completa todos los campos obligatorios y agrega al menos un plato.");
      return;
    }

    const nuevoPedido = {
      mesero: mesero,
      mesa: mesa,
      comentario: inputComentario.value.trim(),
      platos: pedidoActual,
      fecha: new Date().toISOString() // formato ISO para backend
    };

    try {
      const response = await fetch(API_PEDIDOS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoPedido)
      });

      if (!response.ok) {
        throw new Error("Error al enviar pedido: " + response.status);
      }

      const data = await response.json();
      console.log("✅ Pedido registrado en backend:", data);
      alert("Pedido enviado exitosamente al backend ✅");

      // limpiar
      pedidoActual = [];
      inputMesero.value = "";
      inputMesa.value = "";
      inputComentario.value = "";
      actualizarCarrito();

    } catch (error) {
      console.error("❌ Error en la conexión:", error);
      alert("No se pudo enviar el pedido al backend. Revisa la consola.");
    }
  });
});
