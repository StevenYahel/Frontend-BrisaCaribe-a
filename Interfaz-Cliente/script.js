document.addEventListener('DOMContentLoaded', () => {
  const abrirMenu = document.getElementById('abrirMenu');
  const cerrarMenu = document.getElementById('cerrarMenu');
  const menuLateral = document.getElementById('menuLateral');
  const fondoOscuro = document.getElementById('fondoOscuro');

  abrirMenu.addEventListener('click', () => {
    menuLateral.classList.add('show');
    fondoOscuro.classList.add('show');
  });

  cerrarMenu.addEventListener('click', () => {
    menuLateral.classList.remove('show');
    fondoOscuro.classList.remove('show');
  });

  fondoOscuro.addEventListener('click', () => {
    menuLateral.classList.remove('show');
    fondoOscuro.classList.remove('show');
  });
});
