class PatitaApp {
  constructor() {
    this.apiUrl = "get_reportes.php"; // Asegurate de que esté correctamente configurado si usás rutas relativas
    this.init();
  }

  init() {
    this.setupNavigation();
    this.setupGlobalEventListeners();
    this.checkAuthStatus();
  }

  setupNavigation() {
    const navLinks = document.getElementById("navLinks");

    window.showMenu = () => {
      if (navLinks) navLinks.style.right = "0";
    };

    window.hideMenu = () => {
      if (navLinks) navLinks.style.right = "-200px";
    };

    const menuLinks = navLinks?.querySelectorAll("a");
    menuLinks?.forEach((link) => {
      link.addEventListener("click", () => {
        window.hideMenu();
      });
    });
  }

  setupGlobalEventListeners() {
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("pet-modal")) {
        this.closeModal(e.target);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modals = document.querySelectorAll(".pet-modal");
        modals.forEach((modal) => {
          if (modal.style.display === "block") {
            this.closeModal(modal);
          }
        });
      }
    });
  }

  checkAuthStatus() {
    const user = this.getCurrentUser();
    const loginBtn = document.getElementById("loginBtn");
    const panelBtn = document.getElementById("panelBtn");

    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (panelBtn) panelBtn.style.display = "block";
    } else {
      if (loginBtn) loginBtn.style.display = "block";
      if (panelBtn) panelBtn.style.display = "none";
    }
  }

  getCurrentUser() {
    try {
      const userData = localStorage.getItem("patita_user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      return null;
    }
  }

  setCurrentUser(user) {
    try {
      localStorage.setItem("patita_user", JSON.stringify(user));
      this.checkAuthStatus();
    } catch (error) {
      console.error("Error al guardar usuario:", error);
    }
  }

  logout() {
    localStorage.removeItem("patita_user");
    this.checkAuthStatus();
    window.location.href = "index.html";
  }

  async apiRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: { "Content-Type": "application/json" },
    };

    const user = this.getCurrentUser();
    if (user?.token) {
      defaultOptions.headers["Authorization"] = `Bearer ${user.token}`;
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    const response = await fetch(endpoint, finalOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error en la petición");
    }

    return data;
  }

  showAlert(element, message, type = "error") {
    if (!element) return;
    element.className = `alert ${type}`;
    element.textContent = message;
    element.style.display = "block";
    setTimeout(() => (element.style.display = "none"), 5000);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Hace 1 día";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;

    return this.formatDate(dateString);
  }

  createPetCard(pet) {
    const card = document.createElement("div");
    card.className = "pet-card";
    card.onclick = () => this.openPetModal(pet);

    const statusBadge = pet.status === "resuelto"
      ? '<span class="badge badge-secondary">Resuelto</span>'
      : '<span class="badge badge-success">Activo</span>';

    const typeBadge = pet.report_type?.toLowerCase().includes("perd")
      ? '<span class="badge badge-danger">Perdido</span>'
      : '<span class="badge badge-warning">Encontrado</span>';

    card.innerHTML = `
      <div class="pet-card-image">
        <img src="${pet.photo || "/placeholder.svg?height=200&width=280"}" alt="${pet.name || "Mascota"}">
        <div class="pet-card-badges">
          ${statusBadge}
          ${typeBadge}
        </div>
      </div>
      <div class="pet-card-content">
        <h3 class="pet-card-title">${pet.name || "Sin nombre"}</h3>
        <div class="pet-card-info">
          <div class="pet-card-info-item"><i class="fas fa-paw"></i><span>${this.capitalizeFirst(pet.animal_type)}</span></div>
          <div class="pet-card-info-item"><i class="fas fa-map-marker-alt"></i><span>${pet.location}</span></div>
          <div class="pet-card-info-item"><i class="fas fa-calendar-alt"></i><span>${this.formatRelativeDate(pet.date)}</span></div>
        </div>
        <div class="pet-card-actions">
          <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.location.href='mascota.html?id=${pet.id}'">Ver detalles</button>
          <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); patitaApp.contactOwner(${pet.id})">Contactar</button>
        </div>
      </div>
    `;
    return card;
  }

  openPetModal(pet) {
    const modal = document.getElementById("petModal");
    const modalBody = document.getElementById("petModalBody");
    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <div class="pet-modal-header">
        <h2>${pet.name || "Sin nombre"}</h2>
        <div class="pet-modal-badges">
          ${pet.status === "resuelto"
            ? '<span class="badge badge-secondary">Resuelto</span>'
            : '<span class="badge badge-success">Activo</span>'}
          ${pet.report_type?.toLowerCase().includes("perd")
            ? '<span class="badge badge-danger">Perdido</span>'
            : '<span class="badge badge-warning">Encontrado</span>'}
        </div>
      </div>
      <div class="pet-modal-content-body">
        <div class="pet-modal-image">
          <img src="${pet.photo || "/placeholder.svg?height=300&width=400"}" alt="${pet.name || "Mascota"}">
        </div>
        <div class="pet-modal-info">
          <div class="pet-info-item"><i class="fas fa-paw"></i><span>Tipo: <strong>${this.capitalizeFirst(pet.animal_type)}</strong></span></div>
          <div class="pet-info-item"><i class="fas fa-calendar-alt"></i><span>Fecha: <strong>${this.formatDate(pet.date)}</strong></span></div>
          <div class="pet-info-item"><i class="fas fa-map-marker-alt"></i><span>Ubicación: <strong>${pet.location}</strong></span></div>
          <div class="pet-description"><h4>Descripción</h4><p>${pet.description}</p></div>
          <div class="pet-modal-actions">
            <button class="btn btn-primary" onclick="window.location.href='mascota.html?id=${pet.id}'">Ver detalles completos</button>
            <button class="btn btn-outline" onclick="patitaApp.contactOwner(${pet.id})">Contactar</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = "block";
    const closeBtn = modal.querySelector(".close-modal");
    if (closeBtn) closeBtn.onclick = () => this.closeModal(modal);
  }

  closeModal(modal) {
    modal.style.display = "none";
  }

  async contactOwner(petId) {
  const user = this.getCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para contactar al propietario");
    window.location.href = "login.html";
    return;
  }

  try {
    // Obtener datos del reporte por ID
    const pet = await this.apiRequest(`get_reporte.php?idReporte=${petId}`);

    if (!pet.phone) {
      alert("El propietario no ha proporcionado un número de teléfono.");
      return;
    }

    // Limpiar y formatear número
    const phoneNumber = pet.phone.replace(/\D/g, ""); // Solo números

    // Mensaje opcional
    const message = encodeURIComponent(`¡Hola! Vi tu publicación en PatitApp sobre la mascota "${pet.name || 'sin nombre'}". ¿Podemos hablar?`);

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    // Redirigir
    window.open(whatsappUrl, "_blank");
  } catch (error) {
    console.error("Error al contactar al dueño:", error);
    alert("No se pudo obtener el contacto del dueño.");
  }
}

  capitalizeFirst(str) {
    return str?.charAt(0).toUpperCase() + str?.slice(1) || "";
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  async loadPetCards(containerId) {
  console.log("Iniciando carga de mascotas..."); // Debug
  const container = document.getElementById(containerId);
  if (!container) return;

  this.showLoading(container);

  try {
    console.log("Haciendo petición a la API..."); // Debug
    const reportes = await this.apiRequest("get_reportes.php");
    console.log("Datos recibidos:", reportes); // Debug

    this.hideLoading(container);
    container.innerHTML = "";

    if (!reportes.length) {
      container.innerHTML = "<p>No hay reportes disponibles.</p>";
      return;
    }

    reportes.forEach((pet) => {
      const card = this.createPetCard(pet);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error en loadPetCards:", error); // Debug
    this.hideLoading(container);
    container.innerHTML = "<p>Error al cargar los reportes.</p>";
  }
}

  showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="loading">Cargando...</div>';
    }
  }

  hideLoading(element) {
    const loading = element?.querySelector(".loading");
    if (loading) loading.remove();
  }
}

const patitaApp = new PatitaApp();
window.patitaApp = patitaApp;
