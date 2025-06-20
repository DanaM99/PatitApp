// session.js
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  const panelBtn = document.getElementById('panelBtn');
  const navLinks = document.querySelector('.nav-links ul');

  // Mostrar/ocultar botones según sesión
  if (user) {
    // Usuario logueado: ocultar "Iniciar Sesión", mostrar "Cerrar Sesión"
    if (loginBtn) loginBtn.style.display = 'none';

    // Agregar botón Cerrar sesión si no existe aún
    if (!document.getElementById('logoutBtn')) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#" id="logoutBtn">Cerrar Sesión</a>`;
      navLinks.appendChild(li);

      // Evento para cerrar sesión
      document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    }
  } else {
    // Usuario no logueado: mostrar "Iniciar Sesión", quitar "Cerrar Sesión" si existe
    if (loginBtn) loginBtn.style.display = 'block';
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.parentElement.remove();
  }

  // Evitar que un usuario logueado acceda a login.html
  if (user && window.location.pathname.endsWith('login.html')) {
    window.location.href = 'index.html';
  }

  // Funciones para manejar sesión
  function getCurrentUser() {
    try {
      const userData = localStorage.getItem('patita_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  function logout() {
    localStorage.removeItem('patita_user');
    window.location.href = 'index.html';
  }
});
