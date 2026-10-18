/* ════════════════════════════════════════════════════
   MANGAVAULT — manga.js
   Lógica principal de la biblioteca

   ESTRUCTURA:
   1. BASE DE DATOS (BD_MANGAS) — Aquí agregas tus mangas
   2. ESTADO de la aplicación
   3. FUNCIONES de renderizado (estilo Ticket)
   4. BÚSQUEDA Y FILTROS
   5. INICIO de la app
════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════
   1. BASE DE DATOS DE MANGAS

   Para agregar un nuevo manga, copia un bloque
   de { ... } y cámbialo con tus datos.

   Campos:
     id          — número único (no repetir)
     nombre      — Título del manga/manwha
     tipo        — "manga" | "manwha" | "manhwa"
     imagen      — URL de la portada (o ruta local)
     descripcion — Breve sinopsis
     links       — Array de sitios donde se puede leer
       · nombre  — Nombre del sitio
       · url     — Enlace directo
       · icono   — Emoji decorativo
═══════════════════════════════════════════════════ */
const BD_MANGAS = [
  {
    id: 1,
    nombre: "Urenokori No Dorei Elf O Hirotta No De Musume Ni Suru Koto Ni Shita",
    tipo: "manga",
    imagen: "https://cdn.shademanga.com/portadas/u/urenokori-no-dorei-elf-o-hirotta-no-de-musume-ni-suru-koto-ni-shita.jpg?v=639192494836896940",
    descripcion: "",
    links: [
      { nombre: "ShadeManga",  url: "https://shademanga.com/serie/Pkpo6w", icono: "📖" },
      
    ]
  },
  {
    id: 2,
    nombre: "El Héroe no Puede Descansar",
    tipo: "manwha",
    imagen: "https://media.imagesolymp.xyz/comics/covers/1775/tmpzwfu7r1b-xl.webp",
    descripcion: "",
    links: [
      
      { nombre: "Olympus Scan", url: "https://olympusxyz.com/series/comic-el-heroe-no-puede-descansar",icono: "🗡️" },
      
    ]
  },
  {
    id: 3,
    nombre: "Saotome-Senshu, Hitakakusu",
    tipo: "manga",
    imagen: "https://thumbs.visormanga.com/cover/5f6316d6113ce.jpg",
    descripcion: "",
    links: [
      { nombre: "Novel Cool", url: "https://es.novelcool.com/novel/Saotome-Senshu-Hitakakusu.html", icono: "🗼" },
      { nombre: "ShadeManga", url: "https://shademanga.com/serie/3Ssqaf", icono: "📖" },
    ]
  },
  {
    id: 4,
    nombre: "LEVEL KANSTO KARA HAJIMARU, KAMISAMA TEKI ISEKAI LIFE: SAIKYOU STATUS NI TENSEI SHITA NODE SUKI NI IKIMASU",
    tipo: "manga",
    imagen: "https://s1.cdnlxd.xyz/manga/covers/level-kansto-kara-hajimaru-kamisama-teki-isekai-life-saikyou-status-ni-tensei-shita-node-suki-ni-ikimasu.webp",
    descripcion: "",
    links: [
      { nombre: "MangaDex",  url: "https://mangadex.org/title/cdc836d6-4475-4e16-8da6-f6f4c7ed3c62/level-count-stop-kara-hajimaru-kamisama-teki-isekai-life-saikyou-status-ni-tensei-shita-node-suki-ni", icono: "📖" },
      { nombre: "LectorXD", url: "https://lectorxd.com/manga/level-kansto-kara-hajimaru-kamisama-teki-isekai-life-saikyou-status-ni-tensei-shita-node-suki-ni-ikimasu", icono: "🌐" },
      
    ]
  },
  {
    id: 5,
    nombre: "Goshujinsama to Yuku Isekai Survival!",
    tipo: "manga",
    imagen: "https://s1.cdnlxd.xyz/manga/covers/goshujinsamatoyukuisekaisurvival.webp",
    descripcion: "",
    links: [
      { nombre: "LectorXD", url: "https://lectorxd.com/manga/goshujinsamatoyukuisekaisurvival", icono: "📖" },
      { nombre: "TuMangaOnline",  url: "https://zonatmo.org/library/manga/12510/goshujinsama-to-yuku-isekai-survival",     icono: "🌐" },
    ]
  },
  {
    id: 6,
    nombre: "Oda de los Valientes",
    tipo: "manwha",
    imagen: "https://media.imagesolymp.xyz/comics/covers/1772/tmpfvj8h1e3-xl.webp",
    descripcion: "",
    links: [
      { nombre: "olympus Scan", url: "https://mangadex.org/title/vinland-saga", icono: "📖" },
      
    ]
  },
  {
    id: 7,
    nombre: "La venganza del sabueso de sangre de hierro",
    tipo: "manwha",
    imagen: "https://media.imagesolymp.xyz/comics/covers/743/sabueso-venganza-xl.webp",
    descripcion: "",
    links: [
      { nombre: "olympus Scan", url: "https://olympusxyz.com/series/comic-20-225-2sabueso13424", icono: "📖" },
      
    ]
  },
  {
    id: 8,
    nombre: "Mi relajante tienda de conveniencia de la academia",
    tipo: "manwha",
    imagen: "https://s1.cdnlxd.xyz/manga/covers/mi-relajante-tienda-de-conveniencia-de-la-academia.webp?v=1787983412907",
    descripcion: "",
    links: [
      { nombre: "LectorXD", url: "https://lectorxd.com/manhwa/mi-relajante-tienda-de-conveniencia-de-la-academia", icono: "📖" },
      { nombre: "ManhwaWeb", url: "https://manhwaweb.com/manhwa/mi-relajante-tienda-de-conveniencia-de-la-academia_1787728508032", icono: "📖" },
      { nombre: "VortexScan", url: "https://vortexscans.org/series/my-relaxing-academy-convenience-store", icono: "📖" },
      
    ]
  },
  {
    id: 9,
    nombre: "Nan no Torie mo Nai Heibon na Ore ga Bijin Futago Shimai wo Inochigake de Tasuketa Kekka, Jitsu wa Yandere Datta Futari wo Gachi Horesasete Shimatta Ken",
    tipo: "manga",
    imagen: "https://s1.cdnlxd.xyz/mangas/covers/nan-no-torie-mo-nai-heibon-na-ore-ga-bijin-futago-shimai-wo-inochigake-de-tasuketa-kekka-jitsu-wa-yandere-datta-futari-wo-gachi-horesasete-shimatta-ken_1788606777421.webp",
    descripcion: "",
    links: [
      { nombre: "LectorXD", url: "https://lectorxd.com/manga/nan-no-torie-mo-nai-heibon-na-ore-ga-bijin-futago-shimai-wo-inochigake-de-tasuketa-kekka-jitsu-wa-yandere-datta-futari-wo-gachi-horesasete-shimatta-ken", icono: "📖" },
      { nombre: "ManhwaWeb", url: "https://www.manhwaweb.com/manhwa/imai-wo-inochigake-de-tasuketa-kekka-jitsu-wa-yandere-datta-futari-wo-gachi-horesasete-shimatta-ken_1787978512785", icono: "📖" }, 
    ]
  },
  {
    id: 10,
    nombre: "Nan no Torie mo Nai Heibon na Ore ga Bijin Futago Shimai wo Inochigake de Tasuketa Kekka, Jitsu wa Yandere Datta Futari wo Gachi Horesasete Shimatta Ken",
    tipo: "manwha",
    imagen: "https://img.novelcool.com/logo/202405/71/El_Conocimiento_De_Mi_Madrastra2975.jpg",
    descripcion: "",
    links: [
      { nombre: "MangasNoSekai", url: "https://mangasnosekai.com/manga/el-conocimiento-de-mi-madrastra/?__cf_chl_tk=qdQ6of6lzUnDrVka6ngcil9EACiY5cl3BzwEu8Hngj0-1790591606-1.0.1.1-YodiY1TLkDsxN3W9SL_EuTR7zyrZ45QLzOhwf7oachk", icono: "📖" },
      { nombre: "NovelCool", url: "https://www.manhwaweb.com/manhwa/imai-wo-inochigake-de-tasuketa-kekka-jitsu-wa-yandere-datta-futari-wo-gachi-horesasete-shimatta-ken_1787978512785", icono: "📖" }, 
    ]
  },
  {
    id: 10,
    nombre: "Megane Tokidoki Yankee Kun",
    tipo: "manga",
    imagen: "https://s1.cdnlxd.xyz/manga/covers/megane-tokidoki-yankee-kun.webp",
    descripcion: "",
    links: [
      { nombre: "ShadeManga", url: "hthttps://shademanga.com/serie/VZBfjK", icono: "📖" },
      { nombre: "LectorXD", url: "https://lectorxd.com/manga/megane-tokidoki-yankee-kun", icono: "📖" },
    ]
  },
];


/* ═══════════════════════════════════════════════════
   2. ESTADO DE LA APLICACIÓN
═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   FAVORITOS — persistencia en localStorage
   Clave: "mangas_favoritos" (array de IDs como texto)
═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   PANTALLA DE CARGA GLOBAL (#loading-overlay)
   Se muestra brevemente en login/logout, filtros y menú admin.
   NO se usa al abrir/leer un ticket.
═══════════════════════════════════════════════════ */
let _cargaTimer = null;
function mostrarCarga(accion, duracion = 450) {
  const overlay = document.getElementById("loading-overlay");
  if (!overlay) { if (accion) accion(); return; }
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  // La acción corre ya con el overlay pintado, así el cambio de contenido queda oculto detrás
  requestAnimationFrame(() => { if (accion) accion(); });
  clearTimeout(_cargaTimer);
  _cargaTimer = setTimeout(() => {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
  }, duracion);
}

const CLAVE_FAVORITOS = "mangas_favoritos";

function getFavoritos() {
  try {
    const arr = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS) || "[]");
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch (e) {
    return [];
  }
}

function esFavorito(id) {
  return getFavoritos().includes(String(id));
}

function setFavorito(id, marcado) {
  const sid = String(id);
  const favs = getFavoritos().filter(f => f !== sid);
  if (marcado) favs.push(sid);
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favs));
}


const estado = {
  filtroActivo: "todos",
  textoBusqueda: "",
};


/* ═══════════════════════════════════════════════════
   3. FUNCIONES DE RENDERIZADO — ESTILO TICKET

   Cada manga se renderiza como una tarjeta tipo
   "ticket de evento" con:
     · Parte superior (t-main): portada + info
     · Perforación: línea punteada separadora
     · Parte inferior (t-stub): links de lectura
═══════════════════════════════════════════════════ */

/**
 * Filtra la lista según el estado actual.
 * Incluye los mangas agregados/editados por el admin
 * y excluye los eliminados (gestionado por admin.js).
 */
function obtenerMangasFiltrados() {
  // getMangasCombinados() está definida en admin.js
  // Si admin.js no está cargado aún, usa BD_MANGAS como fallback
  const fuente = (typeof getMangasCombinados === 'function')
    ? getMangasCombinados()
    : BD_MANGAS;

  return fuente.filter(manga => {
    const cumpleTipo = estado.filtroActivo === "todos"
      ? true
      : manga.tipo === estado.filtroActivo;

    const texto = estado.textoBusqueda.toLowerCase();
    const cumpleBusqueda =
      manga.nombre.toLowerCase().includes(texto) ||
      (manga.descripcion || '').toLowerCase().includes(texto);

    // Filtro especial: solo los mangas guardados como favoritos
    if (estado.filtroActivo === "favoritos") {
      return esFavorito(manga.id) && cumpleBusqueda;
    }
    return cumpleTipo && cumpleBusqueda;
  });
}

/**
 * Genera los botones de links para el stub del ticket.
 * @param {Array} links — Array de links del manga
 * @returns {string} — HTML de los links
 */
function generarLinks(links) {
  return links.map(link => `
    <a
      class="t-link-btn"
      href="${link.url}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="t-link-icon" aria-hidden="true"><i class="fi fi-rr-book-alt"></i></span>
      <span class="t-link-name">${link.nombre}</span>
      <span class="t-link-arrow" aria-hidden="true"><i class="fi fi-rr-arrow-right"></i></span>
    </a>
  `).join("");
}

/**
 * Crea una tarjeta tipo TICKET para un manga.
 * @param {Object} manga — Objeto de la BD
 * @returns {HTMLElement} — Elemento listo para insertar
 */
function crearTicket(manga) {
  const wrapper = document.createElement("div");
  wrapper.className = "ticket-wrapper";
  wrapper.dataset.id = manga.id;

  const imgSrc = manga.imagen ||
    "https://placehold.co/300x400/1a1a28/888?text=Sin+Imagen";

  wrapper.innerHTML = `
    <!-- INNER: este div es el que rota al recibir .is-flipped -->
    <div class="ticket-flip-inner">

      <!-- ══ FRENTE ══ -->
      <div class="ticket-front">
        <div class="manga-ticket">

          <!-- PARTE SUPERIOR: portada + info -->
          <div class="t-main">
            <div class="t-cover-container">
              <img
                class="t-cover"
                src="${imgSrc}"
                alt="Portada de ${manga.nombre}"
                loading="lazy"
                decoding="async"
                referrerpolicy="no-referrer"
                width="300"
                height="400"
                onerror="this.src='https://placehold.co/300x400/1a1a28/888?text=Sin+imagen'"
              />
            </div>
            <div class="t-img-overlay"></div>
            <!-- Marcador de favorito -->
            <label class="ui-bookmark" data-manga-id="${manga.id}" title="Guardar en favoritos">
              <input type="checkbox" class="bookmark-checkbox" aria-label="Guardar ${manga.nombre} en favoritos">
              <div class="bookmark" aria-hidden="true">
                <svg viewBox="0 0 32 32" role="presentation">
                  <g>
                    <path d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z"></path>
                  </g>
                </svg>
              </div>
            </label>
            <div class="t-content">
              <div class="t-header">
                <span class="t-type-badge">${manga.tipo}</span>
              </div>
              <h2 class="t-title">${manga.nombre}</h2>
              <p class="t-subtitle">${manga.descripcion}</p>
            </div>
          </div>

          <!-- PERFORACIÓN -->
          <div class="t-perforation" aria-hidden="true">
            <div class="t-perf-line"></div>
          </div>

          <!-- STUB: links + botón de giro -->
          <div class="t-stub">
            <p class="t-stub-title"><i class="fi fi-rr-books" aria-hidden="true"></i> Elige dónde leer</p>
            <div class="t-links">
              ${generarLinks(manga.links)}
            </div>

            <!-- Botón neon para girar al reverso -->
            <div class="t-flip-row">
              <button type="button" class="flip-btn flip-btn--to-back" title="Ver mis notas" aria-label="Ver mis notas personales de ${manga.nombre}">
                <div class="btn-a btn-l" aria-hidden="true"></div>
                <div class="btn-a btn-r" aria-hidden="true"></div>
                <div class="btn-a btn-t" aria-hidden="true"></div>
                <div class="btn-a btn-b" aria-hidden="true"></div>
                <span class="btn-text"><i class="fi fi-rr-edit" aria-hidden="true"></i> Mis notas</span>
              </button>
            </div>
          </div>

        </div>
      </div>
      <!-- ══ FIN FRENTE ══ -->

      <!-- ══ REVERSO: notas personales ══ -->
      <div class="ticket-back">

        <div class="t-back-header">
          <div class="t-back-icon" aria-hidden="true"><i class="fi fi-rr-edit"></i></div>
          <div class="t-back-title">${manga.nombre}</div>
          <div class="t-back-hint">Mis notas personales</div>
        </div>

        <div class="t-back-perf" aria-hidden="true">
          <div class="t-perf-line"></div>
        </div>

        <div class="t-back-body">
          <p class="t-notes-label"><i class="fi fi-rr-pencil" aria-hidden="true"></i> Mis apuntes</p>
          <textarea
            class="t-notes-area"
            aria-label="Mis apuntes personales sobre ${manga.nombre}"
            placeholder="Ej: Voy en el cap. 47, me quedé en la batalla del arco de Wano..."
          ></textarea>

          <!-- Botón neon para volver al frente -->
          <div class="t-flip-row">
            <button type="button" class="flip-btn flip-btn--to-front" title="Volver a ver el manga" aria-label="Volver a la portada de ${manga.nombre}">
              <div class="btn-a btn-l" aria-hidden="true"></div>
              <div class="btn-a btn-r" aria-hidden="true"></div>
              <div class="btn-a btn-t" aria-hidden="true"></div>
              <div class="btn-a btn-b" aria-hidden="true"></div>
              <span class="btn-text"><i class="fi fi-rr-arrow-left" aria-hidden="true"></i> Volver</span>
            </button>
          </div>
        </div>

      </div>
      <!-- ══ FIN REVERSO ══ -->

    </div>
  `;

  // ── Lógica de flip: clic en botón → toggle clase ──
  const inner = wrapper.querySelector(".ticket-flip-inner");

  wrapper.querySelector(".flip-btn--to-back").addEventListener("click", (e) => {
    e.stopPropagation();
    inner.classList.add("is-flipped");
  });

  wrapper.querySelector(".flip-btn--to-front").addEventListener("click", (e) => {
    e.stopPropagation();
    inner.classList.remove("is-flipped");
  });

  // ── Notas por usuario: cargar y guardar ──
  // getNotesKey() viene de auth.js; si no está cargado usa clave genérica
  const notesKey = (typeof getNotesKey === 'function')
    ? getNotesKey(manga.id)
    : `mv_notes_guest_${manga.id}`;

  const textarea = wrapper.querySelector(".t-notes-area");

  // ── Favorito: estado inicial y cambios ──
  const favCheck = wrapper.querySelector(".bookmark-checkbox");
  favCheck.checked = esFavorito(manga.id);
  favCheck.addEventListener("change", () => {
    setFavorito(manga.id, favCheck.checked);
    // Si estamos viendo "Favoritos" y se desmarca, quitar la tarjeta (tras la animación)
    if (estado.filtroActivo === "favoritos" && !favCheck.checked) {
      setTimeout(renderizarGrid, 450);
    }
  });
  textarea.value = localStorage.getItem(notesKey) || '';
  textarea.addEventListener("input", () => {
    localStorage.setItem(notesKey, textarea.value);
  });

  return wrapper;
}



/**
 * Renderiza (dibuja) todos los tickets en la pantalla.
 * Se llama cada vez que cambia el filtro o la búsqueda.
 */
function renderizarGrid() {
  // ── FASE DE LECTURA (sin mutar el DOM para evitar reflows forzados) ──
  const grid = document.getElementById("mangaGrid");
  const contador = document.getElementById("contadorResultados");
  const mangasFiltrados = obtenerMangasFiltrados();
  const total = BD_MANGAS.length;
  const mostrados = mangasFiltrados.length;
  const textoContador = mostrados === total
    ? `${total} títulos en tu biblioteca`
    : `Mostrando ${mostrados} de ${total} títulos`;

  // Construir nodos fuera del DOM vivo
  const fragmento = document.createDocumentFragment();
  if (mangasFiltrados.length === 0) {
    const emptyWrapper = document.createElement("div");
    emptyWrapper.className = "empty-state";
    emptyWrapper.innerHTML = `
      <div class="no-results-container">
        <div class="sleeping-search" aria-hidden="true">
          <i class="fi fi-rr-search icono-lupa-grande"></i>
          <div class="z-container">
            <div class="z z-1">Z</div>
            <div class="z z-2">Z</div>
            <div class="z z-3">Z</div>
            <div class="z z-4">Z</div>
          </div>
        </div>
      </div>
      <p>${(estado.filtroActivo === "favoritos" && !estado.textoBusqueda)
        ? "Aún no has agregado mangas a tus favoritos"
        : `No se encontraron resultados para <strong>"${estado.textoBusqueda}"</strong>`}</p>
      <p style="margin-top:0.5rem;font-size:0.85rem;">${(estado.filtroActivo === "favoritos" && !estado.textoBusqueda)
        ? "Pulsa el marcador de una tarjeta para guardarla aquí."
        : "Prueba con otro nombre o cambia el filtro."}</p>
    `;
    fragmento.appendChild(emptyWrapper);
  } else {
    mangasFiltrados.forEach((manga, i) => {
      const card = crearTicket(manga);
      if (i < 2) {
        const img = card.querySelector('.t-cover');
        if (img) img.loading = 'eager';
      }
      fragmento.appendChild(card);
    });
  }

  // ── FASE DE ESCRITURA (una sola mutación atómica en el DOM) ──
  grid.replaceChildren(fragmento);
  contador.textContent = textoContador;
}


/* ═══════════════════════════════════════════════════
   4. BÚSQUEDA Y FILTROS
═══════════════════════════════════════════════════ */

// Búsqueda en tiempo real
document.getElementById("searchInput").addEventListener("input", (e) => {
  estado.textoBusqueda = e.target.value.trim();
  renderizarGrid();
});

// Botones de filtro por tipo (actualiza estado visual y atributo aria-pressed)
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
    mostrarCarga(() => {
      estado.filtroActivo = btn.dataset.filter;
      renderizarGrid();
    });
  });
});


/* ═══════════════════════════════════════════════════
   5. INICIO DE LA APLICACIÓN
═══════════════════════════════════════════════════ */
renderizarGrid();

