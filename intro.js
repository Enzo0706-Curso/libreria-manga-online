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
    loader.style.pointerEvents = 'none';
    document.documentElement.classList.add('no-intro');
  };

  // ── 1. FASE DE LECTURA PURA (0 accesos a geometría del DOM -> 0 ms de reflow) ──
  let yaVisto = false;
  try { yaVisto = sessionStorage.getItem('mv_intro_marvel_v7') === '1'; } catch (e) {}
  const menosMovimiento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia
    ? window.matchMedia('(max-width: 768px)').matches
    : false;

  if (yaVisto || menosMovimiento || typeof anime === 'undefined') {
    quitar();
    return;
  }
  try { sessionStorage.setItem('mv_intro_marvel_v7', '1'); } catch (e) {}

  // Red de seguridad: pase lo que pase, el splash nunca se queda pegado
  const seguro = setTimeout(quitar, 8000);

  // Pre-calcular coordenadas aleatorias en memoria (antes de tocar el DOM)
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const rangeX = isMobile ? 80 : 200;
  const rangeY = isMobile ? 60 : 150;
  const letters = Array.from(loader.querySelectorAll('.vault-title .letter'));
  const initialOffsets = letters.map(() => ({
    x: rand(-rangeX, rangeX),
    y: rand(-rangeY, rangeY),
    r: rand(-180, 180)
  }));

  // ── 2. FASE DE ESCRITURA DIFERIDA (Cede el hilo principal para eliminar Long Tasks de 80 ms) ──
  setTimeout(() => {
    requestAnimationFrame(() => {
      const { createTimeline, stagger } = anime;

      const tl = createTimeline({
        onComplete: () => {
          clearTimeout(seguro);
          quitar();
        }
      });

      // Entrada caricaturesca con rangos [desde, hasta] precalculados (sin lecturas del DOM)
      tl.add(letters, {
        translateX: (_, i) => [initialOffsets[i].x, 0],
        translateY: (_, i) => [initialOffsets[i].y, 0],
        rotate: (_, i) => [initialOffsets[i].r, 0],
        scale: [0, 1],
        opacity: [0, 1],
        duration: isMobile ? 800 : 1100,
        delay: stagger(isMobile ? 90 : 130),
        ease: 'outElastic(1, .6)'
      })
      // Aparición de la submarca inferior
      .add('.sub-brand', {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 500,
        ease: 'outQuad'
      }, '-=300')
      // Pausa apreciando los paneles de manga
      .add('.vault-title', {
        scale: [1, 1.04],
        duration: isMobile ? 1600 : 3200,
        ease: 'linear'
      })
      // Salida rápida y fluida
      .add('#intro-loader', {
        opacity: [1, 0],
        scale: [1, 1.04],
        duration: 600,
        ease: 'inOutQuad'
      });
    });
  }, 0);
});

