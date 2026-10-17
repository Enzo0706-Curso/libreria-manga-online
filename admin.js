/* ════════════════════════════════════════════════════
   admin.js — Panel de Administración y CRUD de Mangas
   MangaVault

   Depende de: auth.js (debe cargarse antes)
   Expone:     initAdminPanel()
════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────
   KEYS de localStorage para mangas admin
───────────────────────────────────────── */
const ADMIN_ADDED_KEY   = 'mv_admin_added';   // Mangas nuevos agregados por admin
const ADMIN_EDITED_KEY  = 'mv_admin_edited';  // Ediciones sobre mangas existentes
const ADMIN_DELETED_KEY = 'mv_admin_deleted'; // IDs de mangas eliminados

/* ─────────────────────────────────────────
   CRUD DE MANGAS EN LOCALSTORAGE
───────────────────────────────────────── */

/** Devuelve los mangas agregados por el admin */
function getAdminMangas() {
  return JSON.parse(localStorage.getItem(ADMIN_ADDED_KEY) || '[]');
}

/** Devuelve el mapa de ediciones { id: {campos editados} } */
function getAdminEdits() {
  return JSON.parse(localStorage.getItem(ADMIN_EDITED_KEY) || '{}');
}

/** Devuelve array de IDs eliminados */
function getAdminDeletes() {
  return JSON.parse(localStorage.getItem(ADMIN_DELETED_KEY) || '[]');
}

/** Guarda un nuevo manga (admin) */
function adminAddManga(manga) {
  const list = getAdminMangas();
  // Generar ID único: mayor ID existente + 1
  const allIds = [...BD_MANGAS.map(m => m.id), ...list.map(m => m.id)];
  const newId  = (Math.max(0, ...allIds) + 1);
  const newManga = { ...manga, id: newId, _adminAdded: true };
  list.push(newManga);
  localStorage.setItem(ADMIN_ADDED_KEY, JSON.stringify(list));
  return newManga;
}

/** Edita un manga existente (guarda solo los campos que cambiaron) */
function adminEditManga(id, cambios) {
  const edits = getAdminEdits();
  edits[id] = { ...(edits[id] || {}), ...cambios };
  localStorage.setItem(ADMIN_EDITED_KEY, JSON.stringify(edits));
}

/** Marca un manga como eliminado */
function adminDeleteManga(id) {
  const deleted = getAdminDeletes();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(ADMIN_DELETED_KEY, JSON.stringify(deleted));
  }
  // Si era un manga agregado por admin, borrarlo directamente
  const list = getAdminMangas().filter(m => m.id !== id);
  localStorage.setItem(ADMIN_ADDED_KEY, JSON.stringify(list));
}

/**
 * Devuelve la lista combinada y procesada:
 * BD_MANGAS base + admin_added − admin_deleted + admin_edited
 */
function getMangasCombinados() {
  const deleted = getAdminDeletes();
  const edits   = getAdminEdits();
  const added   = getAdminMangas();

  const base = BD_MANGAS
    .filter(m => !deleted.includes(m.id))
    .map(m => edits[m.id] ? { ...m, ...edits[m.id] } : m);

  const adminOnly = added.filter(m => !deleted.includes(m.id))
    .map(m => edits[m.id] ? { ...m, ...edits[m.id] } : m);

  return [...base, ...adminOnly];
}


/* ─────────────────────────────────────────
   INYECCIÓN DEL HTML DEL PANEL
───────────────────────────────────────── */
function inyectarPanelHTML() {
  const html = `
  <!-- ═══ MODAL DE LOGIN (rediseñado) ═══ -->
  <div id="mv-login-overlay" class="mv-overlay hidden">
    <div class="mv-modal">
      <button class="mv-modal-close" id="mv-login-close" title="Cerrar"><i class="fi fi-rr-cross-small"></i></button>
      <div class="mv-modal-header">
        <span class="mv-modal-icon"><i class="fi fi-rr-lock"></i></span>
        <h2 class="mv-modal-title">Iniciar sesión</h2>
      </div>
      <form id="mv-login-form" autocomplete="off" style="width:100%;display:flex;flex-direction:column;gap:0.9rem;">
        <!-- Input usuario (estilo Smit-Prajapati adaptado) -->
        <div class="mv-input-container">
          <i class="fi fi-rr-user mv-input-icon"></i><input type="text" id="mv-username" placeholder="Usuario" autocomplete="username" />
        </div>
        <!-- Input contraseña -->
        <div class="mv-input-container">
          <i class="fi fi-rr-key mv-input-icon"></i><input type="password" id="mv-password" placeholder="Contraseña" autocomplete="current-password" />
        </div>
        <p class="mv-error hidden" id="mv-login-error"></p>
        <!-- Botón ENTRAR (estilo HAYABUSA adaptado) -->
        <button type="submit" class="mv-login-submit-btn">
          <p class="icon_shadow">ENTRAR
            <svg fill-rule="nonzero" height="28px" width="28px" viewBox="0,0,256,256" xmlns="http://www.w3.org/2000/svg" fill="#e94560">
              <g><g transform="scale(5.12,5.12)">
                <path d="M9,0c-0.265,0-0.52,0.105-0.707,0.293s-0.293,0.441-0.293,0.707c0,0-0.001,2.837,0.641,6.426c0.616,3.451,1.817,7.636,4.301,10.826c-0.033,0.097-0.07,0.192-0.094,0.291c-0.512,2.157-2.248,7.755-3.68,9.902c-0.171,0.257-0.215,0.578-0.117,0.871c0.46,1.382,1.561,3.628,3.018,6.318c-0.016,0.04-0.029,0.081-0.039,0.123c-0.867,3.467-4.477,5.348-4.477,5.348c-0.382,0.191-0.6,0.604-0.543,1.027c0.057,0.423,0.376,0.764,0.795,0.848c0,0,4.316,0.943,7.713-1.313c0.917,1.525,1.871,3.065,2.836,4.555c0.651,1.065,1.718,1.811,2.941,2.057l3.508,0.701c0.129,0.026,0.262,0.026,0.391,0l3.508-0.701c1.222-0.244,2.286-0.989,2.938-2.051c0.983-1.49,1.951-3.021,2.877-4.535c3.391,2.225,7.678,1.287,7.678,1.287c0.419-0.084,0.738-0.424,0.795-0.848c0.057-0.423-0.161-0.836-0.543-1.027c0,0-3.61-1.88-4.477-5.348c-0.002-0.007-0.004-0.014-0.006-0.021c1.463-2.689,2.56-4.957,2.996-6.457c0.082-0.283,0.035-0.589-0.129-0.834c-1.432-2.147-3.167-7.744-3.68-9.9c-0.024-0.1-0.061-0.196-0.094-0.293c2.484-3.19,3.685-7.375,4.301-10.826c0.641-3.589,0.641-6.426,0.641-6.426c0-0.265-0.105-0.52-0.293-0.707s-0.441-0.293-0.707-0.293c-0.37,0.011-0.701,0.223-0.865,0.553c0,0-1.227,2.452-3.068,5.275c-1.838,2.818-4.336,5.979-6.539,7.307c-0.017-0.01-0.034-0.02-0.051-0.029l-4-2c-0.237-0.119-0.512-0.138-0.764-0.054c-0.252,0.084-0.46,0.264-0.578,0.502l-0.105,0.211l-0.105-0.211c-0.168-0.336-0.511-0.55-0.887-0.553c-0.158-0.001-0.314,0.035-0.455,0.105l-4,2c-0.017,0.009-0.034,0.019-0.051,0.029c-2.203-1.328-4.701-4.489-6.539-7.307c-1.841-2.823-3.068-5.275-3.068-5.275c-0.168-0.337-0.512-0.551-0.889-0.553z"/>
              </g></g>
            </svg>
          </p>
        </button>
      </form>
    </div>
  </div>

  <!-- ═══ MODAL CONFIRMAR ELIMINACIÓN ═══ -->
  <div id="mv-confirm-overlay" class="mv-overlay hidden">
    <div class="mv-modal mv-modal-sm">
      <h3 class="mv-modal-title" id="mv-confirm-title">¿Eliminar este manga?</h3>
      <p class="mv-confirm-msg" id="mv-confirm-msg"></p>
      <div class="mv-form-actions">
        <button class="mv-btn mv-btn-secondary" id="mv-confirm-cancel">Cancelar</button>
        <button class="mv-btn mv-btn-danger" id="mv-confirm-ok">Eliminar</button>
      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
}


/* ─────────────────────────────────────────
   BOTÓN FLOTANTE DE LOGIN / ADMIN en header
───────────────────────────────────────── */
function actualizarBotonHeader() {
  const user = getCurrentUser();
  const header = document.querySelector('.header-inner');
  let area = document.getElementById('mv-header-btn-area');
  if (!area) {
    area = document.createElement('div');
    area.id = 'mv-header-btn-area';
    area.className = 'mv-header-auth';
    header.appendChild(area);
  }

  if (!user) {
    area.innerHTML = `
      <button class="mv-login-main-btn" id="mv-open-login">
        <span>Iniciar sesión</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 43">
          <polygon points="39.58,4.46 44.11,0 66,21.5 44.11,43 39.58,38.54 56.94,21.5"></polygon>
          <polygon points="19.79,4.46 24.32,0 46.21,21.5 24.32,43 19.79,38.54 37.15,21.5"></polygon>
          <polygon points="0,4.46 4.53,0 26.42,21.5 4.53,43 0,38.54 17.36,21.5"></polygon>
        </svg>
      </button>
    `;
  } else {
    const badge = user.role === 'admin' ? '<i class="fi fi-rr-settings"></i>' : '<i class="fi fi-rr-user"></i>';
    area.innerHTML = `
      <div class="mv-user-badge">
        <span class="mv-user-icon">${badge}</span>
        <span class="mv-user-name">${user.username}</span>
        <button class="mv-logout-expand-btn" id="mv-logout-btn" title="Cerrar sesión">
          <div class="sign">
            <svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg>
          </div>
          <div class="logout-text">Salir</div>
        </button>
      </div>
      ${user.role === 'admin' ? `
      <!-- Botón Toggle de Ajustes Admin -->
      <button class="setting-btn" id="toggleAdminMenuBtn" title="Menú de administración" aria-expanded="false">
        <span class="bar bar1"></span>
        <span class="bar bar2"></span>
        <span class="bar bar1"></span>
      </button>` : ''}
    `;
  }

  bindHeaderEvents();
}

function bindHeaderEvents() {
  const loginBtn  = document.getElementById('mv-open-login');
  const logoutBtn = document.getElementById('mv-logout-btn');

  loginBtn?.addEventListener('click', () => {
    document.getElementById('mv-login-overlay').classList.remove('hidden');
    document.getElementById('mv-username').focus();
  });

  /* ── Botón de ajustes: muestra / oculta los 3 botones flotantes ── */
  const toggleBtn = document.getElementById('toggleAdminMenuBtn');
  toggleBtn?.addEventListener('click', () => {
    const menu = document.getElementById('mv-float-btn-container');
    if (!menu) return;
    mostrarCarga(() => {
      const abierto = menu.classList.toggle('show-admin-menu');
      toggleBtn.classList.toggle('is-open', abierto);
      toggleBtn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
  });

  logoutBtn?.addEventListener('click', () => {
    // Ocultar el menú flotante antes de cerrar sesión
    document.getElementById('mv-float-btn-container')?.classList.remove('show-admin-menu');
    mostrarCarga(() => {
      logout();
      actualizarBotonHeader();
      quitarBotonesAdmin();
      quitarBotonFlotante();
      renderizarGrid();
    });
  });
}


/* ─────────────────────────────────────────
   BOTONES ADMIN EN CADA TICKET
───────────────────────────────────────── */
function inyectarBotonesAdmin() {
  if (!isAdmin()) return;
  document.querySelectorAll('.ticket-wrapper').forEach(wrapper => {
    if (wrapper.querySelector('.mv-admin-ticket-btns')) return; // ya tiene
    const id = Number(wrapper.dataset.id);
    const btns = document.createElement('div');
    btns.className = 'mv-admin-ticket-btns';
    btns.innerHTML = `
      <button class="mv-edit-ticket-btn noselect" data-id="${id}" title="Editar manga">
        <span class="text">Editar</span>
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </span>
      </button>
      <button class="mv-del-ticket-btn noselect" data-id="${id}" title="Eliminar manga">
        <span class="text">Delete</span>
        <span class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"/>
          </svg>
        </span>
      </button>
    `;
    wrapper.appendChild(btns);

    btns.querySelector('.mv-edit-ticket-btn').addEventListener('click', e => {
      e.stopPropagation();
      abrirFormEditar(id);
    });
    btns.querySelector('.mv-del-ticket-btn').addEventListener('click', e => {
      e.stopPropagation();
      confirmarEliminar(id);
    });
  });
}

function quitarBotonesAdmin() {
  document.querySelectorAll('.mv-admin-ticket-btns').forEach(el => el.remove());
}


/* ─────────────────────────────────────────
   CONFIRMAR ELIMINACIÓN
───────────────────────────────────────── */
function confirmarEliminar(id) {
  const todos  = getMangasCombinados();
  const manga  = todos.find(m => m.id === id);
  const overlay = document.getElementById('mv-confirm-overlay');
  document.getElementById('mv-confirm-msg').textContent =
    `"${manga?.nombre || 'ID ' + id}" será eliminado de la biblioteca.`;
  overlay.classList.remove('hidden');

  const okBtn = document.getElementById('mv-confirm-ok');
  const cancelBtn = document.getElementById('mv-confirm-cancel');

  const doDelete = () => {
    adminDeleteManga(id);
    overlay.classList.add('hidden');
    renderizarGrid();
    if (isAdmin()) setTimeout(inyectarBotonesAdmin, 100);
    okBtn.removeEventListener('click', doDelete);
    cancelBtn.removeEventListener('click', doCancel);
  };
  const doCancel = () => {
    overlay.classList.add('hidden');
    okBtn.removeEventListener('click', doDelete);
    cancelBtn.removeEventListener('click', doCancel);
  };
  okBtn.addEventListener('click', doDelete);
  cancelBtn.addEventListener('click', doCancel);
}


/* ─────────────────────────────────────────
   INIT — Conectar todos los eventos
───────────────────────────────────────── */
function initAdminPanel() {
  inyectarPanelHTML();
  actualizarBotonHeader();

  /* ── Login form ── */
  document.getElementById('mv-login-form').addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('mv-username').value;
    const password = document.getElementById('mv-password').value;
    const result   = login(username, password);
    if (result.success) {
      document.getElementById('mv-login-overlay').classList.add('hidden');
      document.getElementById('mv-username').value = '';
      document.getElementById('mv-password').value = '';
      mostrarCarga(() => {
      actualizarBotonHeader();
      // Redibujar SIEMPRE (admin o usuario normal): crearTicket() lee las notas con
      // getNotesKey(), que ya usa la sesión recién iniciada → notas privadas al instante.
      renderizarGrid();
      if (isAdmin()) {
        inyectarBotonesAdmin();
        inyectarBotonFlotante();
      }
      });
    } else {
      const errEl = document.getElementById('mv-login-error');
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
    }
  });

  /* ── Cerrar login ── */
  document.getElementById('mv-login-close').addEventListener('click', () => {
    document.getElementById('mv-login-overlay').classList.add('hidden');
    document.getElementById('mv-login-error').classList.add('hidden');
  });
  document.getElementById('mv-login-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
  });

  /* ── Re-inyectar botones admin cuando el grid se redibuja (buscar / filtrar) ── */
  const gridEl = document.getElementById('mangaGrid');
  if (gridEl && 'MutationObserver' in window) {
    new MutationObserver(() => { if (isAdmin()) inyectarBotonesAdmin(); })
      .observe(gridEl, { childList: true });
  }

  /* ── Si ya hay sesión activa al cargar ── */
  if (isAdmin()) {
    setTimeout(inyectarBotonesAdmin, 200);
    inyectarBotonFlotante();
  }
}

/* ════════════════════════════════════════════════════
   BOTÓN FLOTANTE "AGREGAR MANGA" + MODAL CENTRADO
   Solo visible para el admin
════════════════════════════════════════════════════ */

let naddLinks = [];
let naddImagenBase64 = null;


function inyectarBotonFlotante() {
  if (document.getElementById('mv-float-btn-container')) return;
  if (!isAdmin()) return; // el boton de Modo Edicion (y los demas) solo existen para el super usuario

    // ── Botones flip (esquina inferior derecha) ──
  const btnHTML = `
    <div id="mv-float-btn-container" class="mv-float-btn-container">
      
      <!-- Boton Modo Edicion (muestra/oculta Editar y Delete de las tarjetas) -->
      <div class="mv-float-item">
        <div class="mv-float-label">Editar</div>
        <div class="checkbox-wrapper">
          <input class="checkbox" id="mv-flip-edit" type="checkbox" />
          <label class="checkbox-label" for="mv-flip-edit" title="Mostrar / ocultar botones de editar y eliminar">
            <div class="checkbox-flip">
              <div class="checkbox-front">
                <svg fill="white" height="30" width="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" class="icon-path"/>
                </svg>
              </div>
              <div class="checkbox-back">
                <svg fill="white" height="32" width="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.29-11.3L22 6l-13 13z" class="icon-path"/>
                </svg>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Boton Usuario -->
      <div class="mv-float-item">
        <div class="mv-float-label">Usuario</div>
        <div class="checkbox-wrapper">
          <input class="checkbox" id="mv-flip-uadd" type="checkbox" />
          <label class="checkbox-label" for="mv-flip-uadd" title="Agregar nuevo usuario">
            <div class="checkbox-flip">
              <div class="checkbox-front" style="background: linear-gradient(135deg, #1a73e8, #60a5fa); box-shadow: 0 4px 18px rgba(26, 115, 232, 0.45);">
                <!-- User SVG -->
                <svg fill="white" height="30" width="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" class="icon-path"/>
                </svg>
              </div>
              <div class="checkbox-back">
                <svg fill="white" height="32" width="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.29-11.3L22 6l-13 13z" class="icon-path"/>
                </svg>
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Boton Manga -->
      <div class="mv-float-item">
        <div class="mv-float-label">Manga</div>
        <div class="checkbox-wrapper">
          <input class="checkbox" id="mv-flip-add" type="checkbox" />
          <label class="checkbox-label" for="mv-flip-add" title="Agregar nuevo manga">
            <div class="checkbox-flip">
              <div class="checkbox-front">
                <!-- Plus SVG -->
                <svg fill="white" height="32" width="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 13H12V19H11V13H5V12H11V6H12V12H19V13Z" class="icon-path"/>
                </svg>
              </div>
              <div class="checkbox-back">
                <svg fill="white" height="32" width="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 19l-7-7 1.41-1.41L9 16.17l11.29-11.3L22 6l-13 13z" class="icon-path"/>
                </svg>
              </div>
            </div>
          </label>
        </div>
      </div>

    </div>`;

  // ── Modal centrado Agregar Usuario (con rol y lista de usuarios) ──
  const userOverlayHTML = `
    <div id="mv-uadd-overlay" class="mv-overlay hidden">
      <div class="mv-nadd-modal" style="max-width: 420px;">
        <button class="mv-modal-close" id="mv-uadd-close" title="Cerrar"><i class="fi fi-rr-cross-small"></i></button>
        <h2 class="mv-nadd-title"><i class="fi fi-rr-user-add"></i> Nuevo Usuario</h2>
        <form id="mv-uadd-form" class="mv-form" autocomplete="off">

          <div class="mv-input-container">
            <i class="fi fi-rr-user mv-input-icon"></i><input type="text" id="mv-uadd-username" placeholder="Nombre de usuario" required minlength="3" autocomplete="off" />
          </div>

          <div class="mv-input-container">
            <i class="fi fi-rr-key mv-input-icon"></i><input type="password" id="mv-uadd-password" placeholder="Contraseña" required minlength="4" autocomplete="new-password" />
          </div>

          <div class="mv-input-container">
            <select id="mv-uadd-role" aria-label="Rol del usuario">
              <option value="user">Usuario normal</option>
              <option value="admin">Súper usuario (admin)</option>
            </select>
          </div>

          <p class="mv-error hidden" id="mv-uadd-error"></p>
          <p class="mv-success hidden" id="mv-uadd-success"></p>

          <div class="mv-form-actions">
            <button type="button" id="mv-uadd-cancel" class="mv-btn mv-btn-secondary">Cerrar</button>
            <button type="submit" class="mv-btn mv-btn-primary"><i class="fi fi-rr-disk"></i> Registrar usuario</button>
          </div>
        </form>

        <button type="button" id="mv-uadd-list-toggle" class="mv-btn mv-btn-secondary mv-btn-full" aria-expanded="false"><i class="fi fi-rr-users"></i> Ver usuarios registrados</button>
        <div id="mv-uadd-list-wrap" class="mv-uadd-list-wrap hidden">
          <div id="mv-users-list" class="mv-users-list"></div>
        </div>
      </div>
    </div>`;

  // ── Modal centrado Agregar Manga ──
  const mangaOverlayHTML = `
    <div id="mv-nadd-overlay" class="mv-overlay hidden">
      <div class="mv-nadd-modal">
        <button class="mv-modal-close" id="mv-nadd-close" title="Cerrar"><i class="fi fi-rr-cross-small"></i></button>
        <h2 class="mv-nadd-title" id="mv-nadd-title"><i class="fi fi-rr-plus"></i> Nuevo Manga</h2>
        <form id="mv-nadd-form" class="mv-form" autocomplete="off">
          <input type="hidden" id="mv-nadd-id" />
          <div class="mv-field">
            <label>Nombre / Título</label>
            <input type="text" id="mv-nadd-nombre" placeholder="Ej: Solo Leveling" required />
          </div>
          <div class="mv-field">
            <label>Tipo</label>
            <select id="mv-nadd-tipo">
              <option value="manga">Manga</option>
              <option value="manwha">Manwha</option>
              <option value="manhwa">Manhwa</option>
            </select>
          </div>
          <div class="mv-field">
            <label>Imagen de portada</label>
            <div class="mv-img-options">
              <div class="mv-radio-row">
                <input type="radio" name="mv-nadd-img-src" id="mv-nadd-img-url" value="url" checked />
                <label for="mv-nadd-img-url"><i class="fi fi-rr-link"></i> URL de imagen</label>
              </div>
              <input type="url" id="mv-nadd-imagen-url" placeholder="https://..." />
              <div class="mv-radio-row">
                <input type="radio" name="mv-nadd-img-src" id="mv-nadd-img-file" value="file" />
                <label for="mv-nadd-img-file"><i class="fi fi-rr-folder"></i> Desde mi dispositivo / galería</label>
              </div>
              <input type="file" id="mv-nadd-imagen-file" accept="image/*" class="hidden" />
              <button type="button" id="mv-nadd-file-btn" class="mv-btn mv-btn-secondary hidden"><i class="fi fi-rr-picture"></i> Elegir imagen</button>
              <img id="mv-nadd-img-preview" class="mv-img-preview hidden" alt="Vista previa" />
            </div>
          </div>
          <div class="mv-field">
            <label>Descripción (opcional)</label>
            <textarea id="mv-nadd-descripcion" rows="2" placeholder="Breve sinopsis..."></textarea>
          </div>
          <div class="mv-field">
            <label>Links de lectura</label>
            <div id="mv-nadd-links-container"></div>
            <button type="button" id="mv-nadd-add-link" class="mv-btn mv-btn-secondary" style="margin-top:0.4rem;"><i class="fi fi-rr-plus"></i> Añadir link</button>
          </div>
          <p class="mv-error hidden" id="mv-nadd-error"></p>
          <div class="mv-form-actions" style="margin-top:1rem;">
            <button type="button" id="mv-nadd-cancel" class="mv-btn mv-btn-secondary">Cancelar</button>
            <button type="submit" class="mv-btn mv-btn-primary"><i class="fi fi-rr-disk"></i> Guardar manga</button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', btnHTML);
  document.body.insertAdjacentHTML('beforeend', userOverlayHTML);
  document.body.insertAdjacentHTML('beforeend', mangaOverlayHTML);

  // ── Modo Edicion: mostrar / ocultar botones Editar y Delete de las tarjetas ──
  document.body.classList.remove('mv-edit-mode');
  document.getElementById('mv-flip-edit').addEventListener('change', e => {
    document.body.classList.toggle('mv-edit-mode', e.target.checked);
    if (e.target.checked) inyectarBotonesAdmin();
  });

  // ── Eventos para Agregar Usuario ──
  document.getElementById('mv-flip-uadd').addEventListener('change', e => {
    if (e.target.checked) abrirUaddOverlay();
    else cerrarUaddOverlay(false);
  });
  document.getElementById('mv-uadd-close').addEventListener('click', () => cerrarUaddOverlay());
  document.getElementById('mv-uadd-cancel').addEventListener('click', () => cerrarUaddOverlay());
  document.getElementById('mv-uadd-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarUaddOverlay();
  });

  // Ver / ocultar lista de usuarios registrados
  document.getElementById('mv-uadd-list-toggle').addEventListener('click', () => {
    const wrap  = document.getElementById('mv-uadd-list-wrap');
    const btn   = document.getElementById('mv-uadd-list-toggle');
    const abrir = wrap.classList.contains('hidden');
    wrap.classList.toggle('hidden', !abrir);
    btn.setAttribute('aria-expanded', String(abrir));
    btn.innerHTML = abrir ? '<i class="fi fi-rr-angle-small-up"></i> Ocultar usuarios registrados' : '<i class="fi fi-rr-users"></i> Ver usuarios registrados';
    if (abrir) renderUsersList();
  });

  // Registrar usuario (con rol)
  document.getElementById('mv-uadd-form').addEventListener('submit', e => {
    e.preventDefault();
    const errEl = document.getElementById('mv-uadd-error');
    const okEl  = document.getElementById('mv-uadd-success');
    errEl.classList.add('hidden');
    okEl.classList.add('hidden');

    const u    = document.getElementById('mv-uadd-username').value.trim();
    const p    = document.getElementById('mv-uadd-password').value;
    const role = document.getElementById('mv-uadd-role').value;

    const result = registerUser(u, p, role);
    if (result.success) {
      okEl.innerHTML = '<i class="fi fi-rr-check-circle"></i> Usuario "' + escHtml(u) + '" registrado como ' + (role === 'admin' ? 'súper usuario' : 'usuario normal') + '.';
      okEl.classList.remove('hidden');
      e.target.reset();
      renderUsersList();
    } else {
      errEl.textContent = result.error;
      errEl.classList.remove('hidden');
    }
  });

  // ── Eventos para Agregar Manga ──
  document.getElementById('mv-flip-add').addEventListener('change', e => {
    if (e.target.checked) abrirNaddOverlay();
    else cerrarNaddOverlay(false);
  });
  document.getElementById('mv-nadd-close').addEventListener('click', cerrarNaddOverlay);
  document.getElementById('mv-nadd-cancel').addEventListener('click', cerrarNaddOverlay);
  document.getElementById('mv-nadd-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) cerrarNaddOverlay();
  });

  document.querySelectorAll('input[name="mv-nadd-img-src"]').forEach(r => {
    r.addEventListener('change', actualizarNaddImagen);
  });
  document.getElementById('mv-nadd-imagen-url').addEventListener('input', e => {
    const prev = document.getElementById('mv-nadd-img-preview');
    if (e.target.value) { prev.src = e.target.value; prev.classList.remove('hidden'); }
    else { prev.classList.add('hidden'); }
  });
  document.getElementById('mv-nadd-file-btn').addEventListener('click', () => {
    document.getElementById('mv-nadd-imagen-file').click();
  });
  document.getElementById('mv-nadd-imagen-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      naddImagenBase64 = evt.target.result;
      const prev = document.getElementById('mv-nadd-img-preview');
      prev.src = naddImagenBase64;
      prev.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('mv-nadd-add-link').addEventListener('click', () => {
    naddLinks.push({ nombre: '', url: '', icono: '' });
    renderNaddLinks();
  });
  document.getElementById('mv-nadd-form').addEventListener('submit', e => {
    e.preventDefault();
    const errEl = document.getElementById('mv-nadd-error');
    errEl.classList.add('hidden');

    const nombre      = document.getElementById('mv-nadd-nombre').value.trim();
    const tipo        = document.getElementById('mv-nadd-tipo').value;
    const modo        = document.querySelector('input[name="mv-nadd-img-src"]:checked')?.value || 'url';
    const imgUrl      = document.getElementById('mv-nadd-imagen-url').value.trim();
    const imagen      = modo === 'file' ? (naddImagenBase64 || imgUrl) : imgUrl;
    const descripcion = document.getElementById('mv-nadd-descripcion').value.trim();
    const linksValidos = naddLinks.filter(l => l.nombre.trim() && l.url.trim());

    if (!nombre) { errEl.textContent = 'El nombre no puede estar vacío.'; errEl.classList.remove('hidden'); return; }
    if (linksValidos.length === 0) { errEl.textContent = 'Agrega al menos un link de lectura.'; errEl.classList.remove('hidden'); return; }

    const idField = document.getElementById('mv-nadd-id').value;
    const datos   = { nombre, tipo, imagen, descripcion, links: linksValidos };
    if (idField) adminEditManga(Number(idField), datos);
    else         adminAddManga(datos);
    cerrarNaddOverlay();
    renderizarGrid();
    setTimeout(inyectarBotonesAdmin, 150);
  });
}

function abrirUaddOverlay() {
  document.getElementById('mv-uadd-form').reset();
  document.getElementById('mv-uadd-error').classList.add('hidden');
  document.getElementById('mv-uadd-success').classList.add('hidden');
  document.getElementById('mv-uadd-list-wrap').classList.add('hidden');
  const t = document.getElementById('mv-uadd-list-toggle');
  t.setAttribute('aria-expanded', 'false');
  t.innerHTML = '<i class="fi fi-rr-users"></i> Ver usuarios registrados';
  document.getElementById('mv-uadd-overlay').classList.remove('hidden');
}

function cerrarUaddOverlay(flipBack = true) {
  document.getElementById('mv-uadd-overlay')?.classList.add('hidden');
  if (flipBack) {
    const cb = document.getElementById('mv-flip-uadd');
    if (cb) cb.checked = false;
  }
}

// Retener funcion quitarBotonFlotante modificada para que quite los 3 overlays
function quitarBotonFlotante() {
  document.body.classList.remove('mv-edit-mode');
  document.getElementById('mv-float-btn-container')?.remove();
  document.getElementById('mv-nadd-overlay')?.remove();
  document.getElementById('mv-uadd-overlay')?.remove();
}


function renderNaddLinks() {
  const container = document.getElementById('mv-nadd-links-container');
  if (!container) return;
  container.innerHTML = '';
  naddLinks.forEach((link, idx) => {
    const row = document.createElement('div');
    row.className = 'mv-link-row';
    row.innerHTML = `
      <input class="mv-nadd-ln" type="text" placeholder="Sitio" value="${link.nombre}" />
      <input class="mv-nadd-lu" type="url"  placeholder="https://..." value="${link.url}" />
      <button type="button" class="mv-ticket-btn mv-delete-btn mv-link-del" data-idx="${idx}"><i class="fi fi-rr-cross-small"></i></button>`;
    row.querySelector('.mv-nadd-ln').addEventListener('input', e => { naddLinks[idx].nombre = e.target.value; });
    row.querySelector('.mv-nadd-lu').addEventListener('input', e => { naddLinks[idx].url    = e.target.value; });
    row.querySelector('.mv-link-del').addEventListener('click', () => { naddLinks.splice(idx, 1); renderNaddLinks(); });
    container.appendChild(row);
  });
}

function actualizarNaddImagen() {
  const modo = document.querySelector('input[name="mv-nadd-img-src"]:checked')?.value || 'url';
  document.getElementById('mv-nadd-imagen-url').classList.toggle('hidden', modo !== 'url');
  document.getElementById('mv-nadd-file-btn').classList.toggle('hidden', modo !== 'file');
}

/** Abre el overlay de manga; si recibe un manga lo abre en modo edicion */
function abrirNaddOverlay(manga) {
  const editando = !!(manga && manga.id !== undefined);
  const esData   = editando && typeof manga.imagen === 'string' && manga.imagen.startsWith('data:');

  naddLinks = (editando && Array.isArray(manga.links) && manga.links.length)
    ? manga.links.map(l => ({ ...l }))
    : [{ nombre: '', url: '', icono: '' }];
  naddImagenBase64 = esData ? manga.imagen : null;

  document.getElementById('mv-nadd-id').value          = editando ? manga.id : '';
  document.getElementById('mv-nadd-title').innerHTML = editando ? '<i class="fi fi-rr-pencil"></i> Editar Manga' : '<i class="fi fi-rr-plus"></i> Nuevo Manga';
  document.getElementById('mv-nadd-nombre').value      = editando ? manga.nombre : '';
  document.getElementById('mv-nadd-tipo').value        = editando ? manga.tipo : 'manga';
  document.getElementById('mv-nadd-imagen-url').value  = (editando && !esData) ? (manga.imagen || '') : '';
  document.getElementById('mv-nadd-descripcion').value = editando ? (manga.descripcion || '') : '';
  document.getElementById('mv-nadd-error').classList.add('hidden');

  const prev = document.getElementById('mv-nadd-img-preview');
  if (editando && manga.imagen) { prev.src = manga.imagen; prev.classList.remove('hidden'); }
  else { prev.classList.add('hidden'); }

  document.getElementById(esData ? 'mv-nadd-img-file' : 'mv-nadd-img-url').checked = true;
  actualizarNaddImagen();
  renderNaddLinks();
  document.getElementById('mv-nadd-overlay').classList.remove('hidden');
}

/** Cierra el overlay y devuelve el botón a su estado "+" */
function cerrarNaddOverlay(flipBack = true) {
  document.getElementById('mv-nadd-overlay')?.classList.add('hidden');
  if (flipBack) {
    const cb = document.getElementById('mv-flip-add');
    if (cb) cb.checked = false;
  }
  naddLinks = [];
  naddImagenBase64 = null;
}

/** Quita el botón flotante y el overlay (al hacer logout) */

/* ════════════════════════════════════════════════════
   LISTA DE USUARIOS (dentro del modal de usuarios)
════════════════════════════════════════════════════ */
function escHtml(t) {
  return String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderUsersList() {
  const container = document.getElementById('mv-users-list');
  if (!container) return;
  const me    = getCurrentUser();
  const users = getAllUsers();
  if (!Array.isArray(users)) { container.innerHTML = ''; return; }

  container.innerHTML = users.map(u => `
    <div class="mv-user-row">
      <div class="mv-user-info">
        <span class="mv-user-row-icon">${u.role === 'admin' ? '<i class="fi fi-rr-settings"></i>' : '<i class="fi fi-rr-user"></i>'}</span>
        <span class="mv-user-row-name">${escHtml(u.username)}</span>
        <span class="mv-role-badge ${u.role === 'admin' ? 'admin' : 'user'}">${u.role === 'admin' ? 'admin' : 'user'}</span>
      </div>
      ${(me && u.username === me.username)
        ? '<span class="mv-you-badge">(tú)</span>'
        : `<button type="button" class="mv-ticket-btn mv-delete-btn mv-del-user" data-user="${escHtml(u.username)}" title="Eliminar"><i class="fi fi-rr-trash"></i></button>`}
    </div>
  `).join('');

  container.querySelectorAll('.mv-del-user').forEach(btn => {
    btn.addEventListener('click', () => {
      const username = btn.dataset.user;
      if (!confirm('¿Eliminar al usuario "' + username + '"? Esta acción no se puede deshacer.')) return;
      const result = deleteUser(username);
      if (result.success) renderUsersList();
      else alert(result.error);
    });
  });
}

/** Editar manga: abre el mismo modal central de "Nuevo Manga" con los datos cargados */
function abrirFormEditar(id) {
  const manga = getMangasCombinados().find(m => m.id === id);
  if (!manga) return;
  abrirNaddOverlay(manga);
}
