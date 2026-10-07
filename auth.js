/* ════════════════════════════════════════════════════
   auth.js — Sistema de Autenticación Local
   MangaVault — Gestión de usuarios y sesiones

   Almacena usuarios en localStorage (sin servidor).
   Cuando se conecte Firebase, solo se reemplaza este
   archivo y el resto de la página no cambia.
════════════════════════════════════════════════════ */

const AUTH_USERS_KEY   = 'mv_users';
const AUTH_SESSION_KEY = 'mv_session';

/* ─────────────────────────────────────────
   INICIALIZACIÓN — Crea el admin por defecto
   si no existe ningún usuario aún.
───────────────────────────────────────── */
function initAuth() {
  if (!localStorage.getItem(AUTH_USERS_KEY)) {
    const defaultUsers = [
      {
        username:  'enzo',
        password:  btoa('daniel0706'), // base64 básico
        role:      'admin',
        createdAt: Date.now()
      }
    ];
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(defaultUsers));
  }
}

/* ─────────────────────────────────────────
   UTILIDADES internas
───────────────────────────────────────── */
function _getUsers() {
  return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
}

function _saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

/* ─────────────────────────────────────────
   LOGIN — Devuelve { success, user } o
           { success: false, error }
───────────────────────────────────────── */
function login(username, password) {
  const users = _getUsers();
  const user  = users.find(
    u => u.username === username.trim() && u.password === btoa(password)
  );
  if (!user) return { success: false, error: 'Usuario o contraseña incorrectos' };

  const session = { username: user.username, role: user.role };
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

/* ─────────────────────────────────────────
   LOGOUT
───────────────────────────────────────── */
function logout() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

/* ─────────────────────────────────────────
   SESIÓN ACTUAL — null si no hay sesión
───────────────────────────────────────── */
function getCurrentUser() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() { return getCurrentUser() !== null; }
function isAdmin()    { return getCurrentUser()?.role === 'admin'; }

/* ─────────────────────────────────────────
   REGISTRAR USUARIO (solo admin)
───────────────────────────────────────── */
function registerUser(username, password, role = 'user') {
  if (!isAdmin())          return { success: false, error: 'Sin permisos de administrador' };
  if (!username?.trim())   return { success: false, error: 'El nombre de usuario no puede estar vacío' };
  if (!password?.trim())   return { success: false, error: 'La contraseña no puede estar vacía' };
  if (username.length < 3) return { success: false, error: 'El usuario debe tener al menos 3 caracteres' };
  if (password.length < 4) return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };

  const users = _getUsers();
  if (users.find(u => u.username === username.trim())) {
    return { success: false, error: `El usuario "${username}" ya existe` };
  }

  users.push({
    username:  username.trim(),
    password:  btoa(password),
    role:      role === 'admin' ? 'admin' : 'user',
    createdAt: Date.now()
  });
  _saveUsers(users);
  return { success: true };
}

/* ─────────────────────────────────────────
   ELIMINAR USUARIO (solo admin, no a sí mismo)
───────────────────────────────────────── */
function deleteUser(username) {
  if (!isAdmin()) return { success: false, error: 'Sin permisos' };
  const me = getCurrentUser();
  if (username === me.username) return { success: false, error: 'No puedes eliminarte a ti mismo' };
  if (username === 'enzo')      return { success: false, error: 'El superadmin no puede ser eliminado' };

  const users    = _getUsers();
  const filtered = users.filter(u => u.username !== username);
  if (filtered.length === users.length) return { success: false, error: 'Usuario no encontrado' };

  _saveUsers(filtered);
  return { success: true };
}

/* ─────────────────────────────────────────
   LISTAR USUARIOS (solo admin)
───────────────────────────────────────── */
function getAllUsers() {
  if (!isAdmin()) return [];
  return _getUsers().map(u => ({
    username:  u.username,
    role:      u.role,
    createdAt: u.createdAt
  }));
}

/* ─────────────────────────────────────────
   CLAVE DE NOTAS POR USUARIO
   Cada usuario tiene su propia clave de notas.
───────────────────────────────────────── */
function getNotesKey(mangaId) {
  const user = getCurrentUser();
  const prefix = user ? user.username : 'guest';
  return `mv_notes_${prefix}_${mangaId}`;
}

/* Arrancar la autenticación al cargar */
initAuth();
