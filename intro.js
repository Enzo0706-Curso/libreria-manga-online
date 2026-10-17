/* ═══════════════════════════════════════════════════
   INTRO SPLASH SCREEN (Anime.js v4)
   Se muestra SOLO en la primera visita de cada sesión del navegador
   (sessionStorage): no reaparece al recargar ni al navegar por filtros.
═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('intro-loader');
  if (!loader) return;

  const quitar = () => {
    loader.style.display = 'none';
    loader.remove();
    document.documentElement.classList.add('no-intro');
  };

  // ¿Ya se mostró en esta sesión? ¿El usuario prefiere menos movimiento?
  let yaVisto = false;
  try { yaVisto = sessionStorage.getItem('mv_intro_marvel_v4') === '1'; } catch (e) {}
  const menosMovimiento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Si la librería no cargó (CDN caído / sin conexión) NO se bloquea la página
  if (yaVisto || menosMovimiento || typeof anime === 'undefined') {
    quitar();
    return;
  }
  try { sessionStorage.setItem('mv_intro_marvel_v4', '1'); } catch (e) {}

  // Red de seguridad: pase lo que pase, el splash nunca se queda pegado (la secuencia dura ~7.8s)
  const seguro = setTimeout(quitar, 12000);

  const { createTimeline } = anime;

  const tl = createTimeline({
    onComplete: () => {
      clearTimeout(seguro);
      quitar();
    }
  });

  tl.add('.japanese-title', {
    scale: [2.2, 1],
    opacity: [0, 1],
    duration: 1800, // Entrada un poco más pausada (1.8s)
    ease: 'outExpo'
  })
  .add('.sub-brand', {
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 900,
    ease: 'outQuad'
  }, '-=600')
  .add('.japanese-title', {
    scale: [1, 1.06],
    duration: 4500, // Se extiende a 4.5 segundos para que los paneles pasen lentamente y se disfrute el arte
    ease: 'linear'
  })
  .add('#intro-loader', {
    opacity: [1, 0],
    scale: [1, 1.1],
    duration: 1200, // Transición de salida suave de 1.2 segundos
    ease: 'inOutQuad'
  });
});
