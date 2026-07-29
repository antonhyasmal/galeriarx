// 1. LEER CONFIGURACIÓN DINÁMICA DIRECTAMENTE DEL POST
const v = document.getElementById('visor-tc');
if (v) {
  const TOTAL_CORTES = parseInt(v.getAttribute('data-total')) || 0;
  const RUTA_BASE = v.getAttribute('data-ruta') || "";
  const TEXTOS_ANATOMICOS = window.TEXTOS_ANATOMICOS_POST || {};

  const $ = id => document.getElementById(id);
  const c = $('contador-cortes'), ley = $('descripcion-anatomica');
  let idx = 0, zoom = 1, dx = 0, dy = 0, drag = false, sx, sy;
  
  // Guardaremos las referencias a los elementos e imágenes para no buscarlos en el DOM cada vez
  const cortesElementos = [];
  const imagenesElementos = [];

  // Inicialización e inyección de imágenes
  for (let i = 1; i <= TOTAL_CORTES; i++) {
    const item = document.createElement('div');
    item.className = 'galeria-item-tc' + (i === 1 ? ' activo' : '');

    const img = document.createElement('img');
    img.src = `${RUTA_BASE}${i}.jpg`;
    img.alt = "Corte " + i;
    img.setAttribute('draggable', 'false');

    item.appendChild(img);
    v.appendChild(item);
    
    cortesElementos.push(item);
    imagenesElementos.push(img);
  }

  const tform = () => {
    const img = imagenesElementos[idx];
    if (img) img.style.transform = `translate(${dx}px, ${dy}px) scale(${zoom})`;
  };

  const render = (nIdx) => {
    if (nIdx < 0 || nIdx >= cortesElementos.length) return;
    
    // Limpiar estado anterior
    cortesElementos[idx].classList.remove('activo');
    if (imagenesElementos[idx]) imagenesElementos[idx].style.transform = "none";
    
    idx = nIdx;
    
    // Aplicar nuevo estado
    cortesElementos[idx].classList.add('activo');
    if (c) c.textContent = `Imagen: ${idx + 1} / ${cortesElementos.length}`;
    if (ley) ley.innerHTML = TEXTOS_ANATOMICOS[idx + 1] || "<em style='color:#777;'>Sin anotaciones.</em>";
    tform();
  };

  // ==========================================
  // CORRECCIÓN CRÍTICA DE COORDENADAS TÁCTILES
  // ==========================================
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

  // ==========================================
  // SISTEMA HÍBRIDO DE BOTONES (PC Y MÓVIL)
  // ==========================================
  const asignarAccion = (id, accion) => {
    const el = $(id);
    if (!el) return;

    el.onclick = (e) => {
      e.preventDefault();
      accion();
    };

    el.ontouchstart = (e) => {
      e.preventDefault();
      e.stopPropagation(); 
      accion();
    };
  };

  const verificarEstadoZoom = () => {
    v.classList.toggle('zoom-activo', zoom > 1);
  };

  // Vinculación segura con control de estado activo dinámico
  asignarAccion('btn-tc-invertir', () => {
    const activo = v.classList.toggle('invertido');
    $('btn-tc-invertir')?.classList.toggle('control-activo', activo);
  });

  asignarAccion('btn-tc-zoom-mas', () => {
    if (zoom < 4) {
      zoom += 0.25;
      tform();
      verificarEstadoZoom();
      
      $('btn-tc-zoom-mas')?.classList.add('control-activo');
      $('btn-tc-zoom-menos')?.classList.remove('control-activo');
      $('btn-tc-reset')?.classList.remove('control-activo');
    }
  });

  asignarAccion('btn-tc-zoom-menos', () => {
    if (zoom > 1) {
      zoom -= 0.25;
      if (zoom === 1) {
        dx = dy = 0;
        $('btn-tc-zoom-menos')?.classList.remove('control-activo');
        $('btn-tc-zoom-mas')?.classList.remove('control-activo');
      } else {
        $('btn-tc-zoom-menos')?.classList.add('control-activo');
        $('btn-tc-zoom-mas')?.classList.remove('control-activo');
      }
      tform();
      verificarEstadoZoom();
    }
  });

  asignarAccion('btn-tc-reset', () => {
    zoom = 1;
    dx = dy = 0;
    v.classList.remove('invertido');
    verificarEstadoZoom();
    tform();
    
    ['btn-tc-invertir', 'btn-tc-zoom-mas', 'btn-tc-zoom-menos', 'btn-tc-reset'].forEach(id => $(id)?.classList.remove('control-activo'));
    
    $('btn-tc-reset')?.classList.add('control-activo');
    setTimeout(() => $('btn-tc-reset')?.classList.remove('control-activo'), 300);
  });

  asignarAccion('btn-tc-anterior', () => render(idx - 1));
  asignarAccion('btn-tc-siguiente', () => render(idx + 1));

  // Carga del estado inicial
  render(0);
}
