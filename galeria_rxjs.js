// 1. LEER CONFIGURACIÓN DINÁMICA DIRECTAMENTE DEL POST
const v = document.getElementById('visor-tc');

const TOTAL_CORTES = parseInt(v.getAttribute('data-total')) || 0;
const RUTA_BASE = v.getAttribute('data-ruta') || "";
const TEXTOS_ANATOMICOS = window.TEXTOS_ANATOMICOS_POST || {};

const $ = id => document.getElementById(id);
const c = $('contador-cortes'), ley = $('descripcion-anatomica');
let idx = 0, zoom = 1, dx = 0, dy = 0, drag = false, sx, sy;

// Inicialización e inyección de imágenes
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

// ==========================================
// CORRECCIÓN CRÍTICA DE COORDENADAS TÁCTILES
// ==========================================
const getCoord = e => {
  // Acceso correcto al primer dedo [0] que toca la pantalla
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

// ==========================================
// SISTEMA HÍBRIDO DE BOTONES (PC Y MÓVIL)
// ==========================================
const asignarAccion = (id, accion) => {
  const el = $(id);
  if (!el) return;

  // Acción para PC
  el.onclick = (e) => {
    e.preventDefault();
    accion();
  };

  // Acción inmediata para Móviles (Touch)
  el.ontouchstart = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Evita que el toque se propague al visor negro
    accion();
  };
};
// Función auxiliar para controlar el escudo de scroll según el nivel de zoom
const verificarEstadoZoom = () => {
  if (zoom > 1) {
    v.classList.add('zoom-activo');
  } else {
    v.classList.remove('zoom-activo');
  }
};
// Vinculación segura con control de estado activo dinámico
asignarAccion('btn-tc-invertir', () => {
  const activo = v.classList.toggle('invertido');
  $('btn-tc-invertir').classList.toggle('control-activo', activo);
});

asignarAccion('btn-tc-zoom-mas', () => {
  if (zoom < 4) {
    zoom += 0.25;
    tform();
    verificarEstadoZoom(); // <-- Activa el bloqueo si el zoom supera 1
    
    $('btn-tc-zoom-mas').classList.add('control-activo');
    $('btn-tc-zoom-menos').classList.remove('control-activo');
    $('btn-tc-reset').classList.remove('control-activo');
  }
});

asignarAccion('btn-tc-zoom-menos', () => {
  if (zoom > 1) {
    zoom -= 0.25;
    if (zoom === 1) {
      dx = dy = 0;
      $('btn-tc-zoom-menos').classList.remove('control-activo');
      $('btn-tc-zoom-mas').classList.remove('control-activo');
    } else {
      $('btn-tc-zoom-menos').classList.add('control-activo');
      $('btn-tc-zoom-mas').classList.remove('control-activo');
    }
    tform();
    verificarEstadoZoom(); // <-- Libera el bloqueo si el zoom regresa a 1
  }
});

asignarAccion('btn-tc-reset', () => {
  zoom = 1;
  dx = dy = 0;
  v.classList.remove('invertido');
  verificarEstadoZoom(); // <-- Libera el bloqueo por completo al resetear
  tform();
  
  const botones = ['btn-tc-invertir', 'btn-tc-zoom-mas', 'btn-tc-zoom-menos', 'btn-tc-reset'];
  botones.forEach(id => $(id)?.classList.remove('control-activo'));
  
  $('btn-tc-reset').classList.add('control-activo');
  setTimeout(() => $('btn-tc-reset').classList.remove('control-activo'), 300);
});

// Los botones de navegación simple no necesitan mantenerse encendidos permanentemente
asignarAccion('btn-tc-anterior', () => render(idx - 1));
asignarAccion('btn-tc-siguiente', () => render(idx + 1));

// Carga del estado inicial
render(0);
