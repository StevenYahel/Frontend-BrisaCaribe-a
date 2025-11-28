document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------
  // VARIABLES DEL LAYOUT
  // ------------------------------
  const navLateral = document.getElementById("navLateral");
  const overlay = document.getElementById("overlay");
  const hamburger = document.getElementById("hamburger");
  const closeMenu = document.getElementById("closeMenu");

  const cerrarSesionBtns = [
    document.getElementById("cerrarSesion"),
    document.getElementById("cerrarSesionNav"),
    document.getElementById("cerrarSesionCard")
  ];

  const saludo = document.getElementById("saludo");

  // ------------------------------
  // SALUDO DINÁMICO
  // ------------------------------
  const nombreCliente = localStorage.getItem("nombreCliente") || "Cliente";
  if(saludo) saludo.textContent = `Bienvenido(a), ${nombreCliente}`;

  // ------------------------------
  // MENÚ LATERAL
  // ------------------------------
  function abrirMenu() {
    navLateral.style.transform = "translateX(0)";
    overlay.style.display = "block";
  }

  function cerrarMenuFunc() {
    navLateral.style.transform = "translateX(-100%)";
    overlay.style.display = "none";
  }

  hamburger.addEventListener("click", abrirMenu);
  closeMenu.addEventListener("click", cerrarMenuFunc);
  overlay.addEventListener("click", cerrarMenuFunc);

  // ------------------------------
  // CERRAR SESIÓN
  // ------------------------------
  cerrarSesionBtns.forEach(btn => {
    if(btn) {
      btn.addEventListener("click", () => {
        localStorage.removeItem("nombreCliente");
        alert("Sesión cerrada correctamente.");
        window.location.href = "login.html";
      });
    }
  });

  // ------------------------------
  // EFECTO EN CARDS
  // ------------------------------
  const cards = document.querySelectorAll(".dashboard .card:not(.cerrar)");
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => card.style.transform = "scale(1.05)");
    card.addEventListener("mouseleave", () => card.style.transform = "scale(1)");
  });

  // ------------------------------
  // PEDIDOS DEL CLIENTE
  // ------------------------------
  let pedidosPrevios = [];
  let socket;

  async function obtenerPedidosCliente() {
    try {
      const resp = await fetch("http://localhost:8000/api/pedidos-cliente/");
      const pedidos = await resp.json();

      const contenedor = document.getElementById("pedidos-cliente");
      if (!contenedor) return;

      pedidosPrevios = [...pedidos];
      contenedor.innerHTML = "";

      if (pedidos.length === 0) {
        contenedor.innerHTML = "<p>No hay pedidos registrados.</p>";
        return;
      }

      pedidos.forEach(pedido => {
        let detallesHTML = "<ul>";
        pedido.detalles.forEach(det => {
          detallesHTML += `<li>${det.cantidad} × ${det.producto_nombre} <span style="font-size:12px; color:#555;">($${det.subtotal})</span></li>`;
        });
        detallesHTML += "</ul>";

        const div = document.createElement("div");
        div.className = "pedido-card";

        div.innerHTML = `
          <h3>Pedido #${pedido.id}</h3>
          <p><strong>Mesa:</strong> ${pedido.mesa}</p>
          <p><strong>Total:</strong> $${pedido.total}</p>
          <p><strong>Estado:</strong> ${pedido.estado}</p>
          <p><strong>Productos:</strong> ${detallesHTML}</p>
        `;

        contenedor.appendChild(div);
      });

    } catch(err) {
      console.error("Error al obtener pedidos del cliente:", err);
    }
  }

  setInterval(obtenerPedidosCliente, 5000);
  obtenerPedidosCliente();

  // ------------------------------
  // ALERTAS DE RETRASOS
  // ------------------------------
  async function verificarRetrasos() {
    try {
      const resp = await fetch("http://localhost:8000/api/verificar-retrasos/");
      if (!resp.ok) return;

      const data = await resp.json();
      mostrarAlertaRetrasos(data.alertas);
    } catch(err) {
      console.error("Error al verificar retrasos:", err);
    }
  }

  function mostrarAlertaRetrasos(alertas) {
    let alertaDiv = document.querySelector(".alerta-retrasos");

    if (!alertaDiv) {
      alertaDiv = document.createElement("div");
      alertaDiv.classList.add("alerta-retrasos");
      alertaDiv.style.padding = "12px";
      alertaDiv.style.margin = "10px";
      alertaDiv.style.background = "#ff4d4d";
      alertaDiv.style.color = "white";
      alertaDiv.style.fontWeight = "bold";
      alertaDiv.style.borderRadius = "8px";
      alertaDiv.style.textAlign = "center";
      document.body.prepend(alertaDiv);
    }

    if(alertas.length === 0) {
      alertaDiv.style.display = "none";
      return;
    }

    alertaDiv.style.display = "block";
    alertaDiv.textContent = `⚠️ Hay ${alertas.length} pedido(s) retrasado(s).`;
    reproducirAlerta();
  }

  setInterval(verificarRetrasos, 30000);
  verificarRetrasos();

  // ------------------------------
  // NOTIFICACIONES
  // ------------------------------
  function reproducirAlerta() {
    const audio = new Audio("notificacion.mp3");
    audio.play().catch(() => {});
  }

  function mostrarNotificacion(msg) {
    let noti = document.getElementById("notification");
    if (!noti) {
      noti = document.createElement("div");
      noti.id = "notification";
      noti.className = "notification";
      document.body.appendChild(noti);
    }
    noti.textContent = msg;
    noti.classList.add("show");
    setTimeout(() => noti.classList.remove("show"), 4000);
  }

  // ------------------------------
  // WEBSOCKET CLIENTE
  // ------------------------------
  function conectarWebSocketCliente() {
    socket = new WebSocket("ws://localhost:8000/ws/pedidos/");

    socket.onopen = () => console.log("WebSocket cliente conectado ✅");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.mensaje) {
        mostrarNotificacion(`⚠ ${data.mensaje.alerta} (Mesa ${data.mensaje.mesa})`);
        reproducirAlerta();
        obtenerPedidosCliente();
        verificarRetrasos();
      }
    };

    socket.onclose = () => setTimeout(conectarWebSocketCliente, 5000);
    socket.onerror = (err) => socket.close();
  }

  conectarWebSocketCliente();


    const wsUrl = (window.location.protocol === "https:" ? "wss://" : "ws://")
        + window.location.host
        + "/ws/pedidos/";

    console.log("Conectando a WebSocket:", wsUrl);

    const socketPedidos = new WebSocket(wsUrl);

    socketPedidos.onopen = () => {
        console.log("WebSocket conectado correctamente.");
    };

    socketPedidos.onerror = (error) => {
        console.log("Error en WebSocket:", error);
    };

    socketPedidos.onclose = () => {
        console.log("WebSocket cerrado.");
    };

    socketPedidos.onmessage = (event) => {
        console.log("Mensaje recibido desde WS:", event.data);

        const data = JSON.parse(event.data);

        if (data.mensaje) {
            mostrarNotificacion(data.mensaje.texto, data.mensaje.tipo);
        }
    };

    function mostrarNotificacion(texto, tipo = "info") {
        const colores = {
            "retraso": "background: #ff4d4d; color:white;",
            "info": "background: #007bff; color:white;",
            "success": "background: #28a745; color:white;"
        };

        const div = document.createElement("div");
        div.style = `position: fixed; top: 20px; right: 20px;
                     padding: 15px; border-radius: 8px;
                     font-size: 16px; z-index: 9999; ${colores[tipo]}`;
        div.innerText = texto;

        document.body.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 4000);
    }
    });


    const wsUrl = (window.location.protocol === "https:" ? "wss://" : "ws://")
        + window.location.host
        + "/ws/pedidos/";

    const cocinaSocket = new WebSocket(wsUrl);

    cocinaSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.mensaje) {
            mostrarNotificacionCocina(data.mensaje.texto, data.mensaje.tipo);
        }
    };

    function mostrarNotificacionCocina(texto, tipo = "info") {
        const colores = {
            "retraso": "background: #ff8800; color:white;",
            "info": "background: #0066cc; color:white;",
            "success": "background: #28a745; color:white;"
        };

        const div = document.createElement("div");
        div.style = `position: fixed; top: 20px; left: 20px;
                     padding: 15px; border-radius: 8px;
                     font-size: 16px; z-index: 9999; ${colores[tipo]}`;
        div.innerText = texto;

        document.body.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 4000);
    }

