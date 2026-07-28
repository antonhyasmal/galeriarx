// 1. LEER CONFIGURACIÓN DINÁMICA DIRECTAMENTE DEL POST
const v = document.getElementById('visor-tc');

// Extrae el total y la ruta desde los atributos 'data-' del HTML
const TOTAL_CORTES = parseInt(v.getAttribute('data-total')) || 0;
const RUTA_BASE = v.getAttribute('data-ruta') || "";

// Absorbe el objeto de textos específicos del post actual
const TEXTOS_ANATOMICOS = window.TEXTOS_ANATOMICOS_POST || {};

const $ = id => document.getElementById(id);
const c = $('contador-cortes'), ley = $('descripcion-anatomica');
let idx = 0, zoom = 1, dx = 0, dy = 0, drag = false, sx, sy;

// Inicialización e inyección secuencial de cortes dentro del visor
for (let i = 1; i <= TOTAL_CORTES; i++) {
  const item = document.createElement('div');
  item.className = 'galeria-item-tc' + (i === 1 ? ' activo' : '');

  const img = document.createElement('img');
  img.src = RUTA_BASE + i + ".jpg";
  img.alt = "Corte " + i;
  img.setAttribute('draggable', 'false');

  item.appendChild(img);
  v.appendChild(item);
}

// Captura de elementos posterior a su inyección en el DOM
const cortes = document.querySelectorAll('.galeria-item-tc');

const tform = () => {
  const img = cortes[idx]?.querySelector('img');
  if (img) img.style.transform = `translate(${dx}px, ${dy}px) scale(${zoom})`;
};

const render = (nIdx) => {
  if (nIdx < 0 || nIdx >= cortes.length) return;
  cortes[idx].classList.remove('activo');
  cortes[idx].querySelector('img').style.transform = "none";
  idx = nIdx;
  cortes[idx].classList.add('activo');
  c.textContent = `Imagen: ${idx + 1} / ${cortes.length}`;
  ley.innerHTML = TEXTOS_ANATOMICOS[idx + 1] || "<em style='color:#777;'>Sin anotaciones.</em>";
  tform();
};

// Eventos de Arrastre multiplataforma (Ratón y Touch)
// CORRECCIÓN RADICAL: Extrae correctamente las coordenadas en PC y en Móvil
const getCoord = e => {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
};

const iniciarArrastre = e => {
  if (zoom > 1) {
    drag = true;
    const pos = getCoord(e);
    sx = pos.x - dx;
    sy = pos.y - dy;
  }
};
v.onmousedown = iniciarArrastre;
v.ontouchstart = iniciarArrastre;

const moverArrastre = e => {
  if (drag) {
    if (e.touches) e.preventDefault(); 
    const pos = getCoord(e);
    dx = pos.x - sx;
    dy = pos.y - sy;
    tform();
  }
};
window.onmousemove = moverArrastre;
window.ontouchmove = moverArrastre;

const finalizarArrastre = () => drag = false;
window.onmouseup = finalizarArrastre;
window.ontouchend = finalizarArrastre;
window.ontouchcancel = finalizarArrastre;

// Asignación de eventos de control a la botonera
$('btn-tc-anterior').onclick = () => render(idx - 1);
$('btn-tc-siguiente').onclick = () => render(idx + 1);
$('btn-tc-invertir').onclick = () => v.classList.toggle('invertido');
$('btn-tc-zoom-mas').onclick = () => { if (zoom < 4) { zoom += 0.25; tform(); } };
$('btn-tc-zoom-menos').onclick = () => { if (zoom > 1) { zoom -= 0.25; if (zoom == 1) dx = dy = 0; tform(); } };
$('btn-tc-reset').onclick = () => { zoom = 1; dx = dy = 0; v.classList.remove('invertido'); tform(); };

// Carga del estado inicial
render(0);
