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

  // ── FASE DE LECTURA (sin tocar el DOM para evitar reflows forzados) ──
  let yaVisto = false;
  try { yaVisto = sessionStorage.getItem('mv_intro_marvel_v7') === '1'; } catch (e) {}
  const menosMovimiento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia
    ? window.matchMedia('(max-width: 768px)').matches
    : false;

  // Si la librería no cargó (CDN caído / sin conexión) NO se bloquea la página
  if (yaVisto || menosMovimiento || typeof anime === 'undefined') {
    quitar();
    return;
  }
  try { sessionStorage.setItem('mv_intro_marvel_v7', '1'); } catch (e) {}

  // Red de seguridad: pase lo que pase, el splash nunca se queda pegado
  const seguro = setTimeout(quitar, 10000);

  // Compatibilidad Anime.js v4: exponer anime.random usando anime.utils.random
  if (typeof anime.random !== 'function') {
    anime.random = (min, max) =>
      (anime.utils && typeof anime.utils.random === 'function')
        ? anime.utils.random(min, max)
        : Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const rangeX = isMobile ? 80 : 200;
  const rangeY = isMobile ? 60 : 150;

  // ── FASE DE ESCRITURA (agrupada en el siguiente frame de pintado) ──
  // Se pasan rangos explícitos [desde, hasta] para que Anime.js no tenga que
  // consultar getComputedStyle / offsetWidth tras mutar estilos (0 ms de reflow).
  requestAnimationFrame(() => {
    const { createTimeline, stagger } = anime;

    const tl = createTimeline({
      onComplete: () => {
        clearTimeout(seguro);
        quitar(); // Elimina el nodo del DOM para liberar 100% de memoria RAM y GPU
      }
    });

    // 1. Entrada caricaturesca en un solo paso [desde, hasta] (sin lecturas intermedias del DOM)
    tl.add('.vault-title .letter', {
      translateX: () => [anime.random(-rangeX, rangeX), 0],
      translateY: () => [anime.random(-rangeY, rangeY), 0],
      rotate: () => [anime.random(-180, 180), 0],
      scale: [0, 1],
      opacity: [0, 1],
      duration: isMobile ? 900 : 1200,
      delay: stagger(isMobile ? 100 : 140),
      ease: 'outElastic(1, .6)'
    })
    // 2. Aparición de la submarca inferior
    .add('.sub-brand', {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 600,
      ease: 'outQuad'
    }, '-=300')
    // 3. Pausa apreciando los paneles de manga
    .add('.vault-title', {
      scale: [1, 1.04],
      duration: isMobile ? 3000 : 4000,
      ease: 'linear'
    })
    // 4. Salida rápida y fluida
    .add('#intro-loader', {
      opacity: [1, 0],
      scale: [1, 1.05],
      duration: 800,
      ease: 'inOutQuad'
    });
  });
});
