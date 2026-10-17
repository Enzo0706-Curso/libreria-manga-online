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
  try { yaVisto = sessionStorage.getItem('mv_intro_marvel_v6') === '1'; } catch (e) {}
  const menosMovimiento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Si la librería no cargó (CDN caído / sin conexión) NO se bloquea la página
  if (yaVisto || menosMovimiento || typeof anime === 'undefined') {
    quitar();
    return;
  }
  try { sessionStorage.setItem('mv_intro_marvel_v6', '1'); } catch (e) {}

  // Red de seguridad: pase lo que pase, el splash nunca se queda pegado
  const seguro = setTimeout(quitar, 12000);

  // Compatibilidad Anime.js v4: exponer anime.random usando anime.utils.random
  if (typeof anime.random !== 'function') {
    anime.random = (min, max) =>
      (anime.utils && typeof anime.utils.random === 'function')
        ? anime.utils.random(min, max)
        : Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const { createTimeline, stagger } = anime;

  const tl = createTimeline({
    onComplete: () => {
      clearTimeout(seguro);
      quitar();
    }
  });

  // 1. Animación caricaturesca de entrada: cada letra viene desde coordenadas y ángulos locos
  tl.add('.vault-title .letter', {
    translateX: () => anime.random(-250, 250),
    translateY: () => anime.random(-200, 200),
    rotate: () => anime.random(-360, 360),
    scale: [0, 1.4],
    opacity: [0, 1],
    duration: 0
  })
  .add('.vault-title .letter', {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    duration: 1200,
    delay: stagger(150), // Desfasaje entre cada letra estilo caricatura
    ease: 'outElastic(1, .5)' // Rebote divertido al encajar en el centro
  })
  // 2. Aparición de la submarca inferior
  .add('.sub-brand', {
    opacity: [0, 1],
    translateY: [15, 0],
    duration: 800,
    ease: 'outQuad'
  }, '-=400')
  // 3. Pausa prolongada contemplando los paneles de manga
  .add('.vault-title', {
    scale: [1, 1.05],
    duration: 4500,
    ease: 'linear'
  })
  // 4. Salida cinematográfica limpia
  .add('#intro-loader', {
    opacity: [1, 0],
    scale: [1, 1.1],
    duration: 1000,
    ease: 'inOutQuad'
  });
});
