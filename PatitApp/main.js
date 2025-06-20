// Funciones principales y utilidades globales
class PatitaApp {
  constructor() {
    this.apiUrl = "api/"
    this.init()
  }

  init() {
    this.setupNavigation()
    this.setupGlobalEventListeners()
    this.checkAuthStatus()
  }

  // Configuración de la navegación móvil
  setupNavigation() {
    const navLinks = document.getElementById("navLinks")

    // Función para mostrar menú móvil
    window.showMenu = () => {
      if (navLinks) {
        navLinks.style.right = "0"
      }
    }

    // Función para ocultar menú móvil
    window.hideMenu = () => {
      if (navLinks) {
        navLinks.style.right = "-200px"
      }
    }

    // Cerrar menú al hacer clic en un enlace
    const menuLinks = navLinks?.querySelectorAll("a")
    menuLinks?.forEach((link) => {
      link.addEventListener("click", () => {
        window.hideMenu()
      })
    })
  }

  // Event listeners globales
  setupGlobalEventListeners() {
    // Cerrar modales al hacer clic fuera
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("pet-modal")) {
        this.closeModal(e.target)
      }
    })

    // Cerrar modales con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modals = document.querySelectorAll(".pet-modal")
        modals.forEach((modal) => {
          if (modal.style.display === "block") {
            this.closeModal(modal)
          }
        })
      }
    })
  }

  // Verificar estado de autenticación
  checkAuthStatus() {
    const user = this.getCurrentUser()
    const loginBtn = document.getElementById("loginBtn")
    const panelBtn = document.getElementById("panelBtn")

    if (user) {
      if (loginBtn) {
        loginBtn.style.display = "none"
      }
      if (panelBtn) {
        panelBtn.style.display = "block"
      }
    } else {
      if (loginBtn) {
        loginBtn.style.display = "block"
      }
      if (panelBtn) {
        panelBtn.style.display = "none"
      }
    }
  }

  // Obtener usuario actual del localStorage
  getCurrentUser() {
    try {
      const userData = localStorage.getItem("patita_user")
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error("Error al obtener usuario:", error)
      return null
    }
  }

  // Guardar usuario en localStorage
  setCurrentUser(user) {
    try {
      localStorage.setItem("patita_user", JSON.stringify(user))
      this.checkAuthStatus()
    } catch (error) {
      console.error("Error al guardar usuario:", error)
    }
  }

  // Cerrar sesión
  logout() {
    localStorage.removeItem("patita_user")
    this.checkAuthStatus()
    window.location.href = "index.html"
  }

  // Realizar petición a la API
  async apiRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    }

    const user = this.getCurrentUser()
    if (user && user.token) {
      defaultOptions.headers["Authorization"] = `Bearer ${user.token}`
    }

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(this.apiUrl + endpoint, finalOptions)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error en la petición")
      }

      return data
    } catch (error) {
      console.error("Error en API:", error)
      throw error
    }
  }

  // Mostrar alerta
  showAlert(element, message, type = "error") {
    if (!element) return

    element.className = `alert ${type}`
    element.textContent = message
    element.style.display = "block"

    // Ocultar después de 5 segundos
    setTimeout(() => {
      element.style.display = "none"
    }, 5000)
  }

  // Formatear fecha
  formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Formatear fecha relativa
  formatRelativeDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "Hace 1 día"
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `Hace ${weeks} semana${weeks > 1 ? "s" : ""}`
    } else {
      return this.formatDate(dateString)
    }
  }

  // Crear tarjeta de mascota
  createPetCard(pet) {
    const card = document.createElement("div")
    card.className = "pet-card"
    card.onclick = () => this.openPetModal(pet)

    const statusBadge =
      pet.status === "activa"
        ? '<span class="badge badge-success">Activo</span>'
        : '<span class="badge badge-secondary">Resuelto</span>'

    const typeBadge =
      pet.report_type === "perdida"
        ? '<span class="badge badge-danger">Perdido</span>'
        : '<span class="badge badge-warning">Encontrado</span>'

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
                    <div class="pet-card-info-item">
                        <i class="fas fa-paw"></i>
                        <span>${this.capitalizeFirst(pet.animal_type)}</span>
                    </div>
                    <div class="pet-card-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${pet.location}</span>
                    </div>
                    <div class="pet-card-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${this.formatRelativeDate(pet.date)}</span>
                    </div>
                </div>
                <div class="pet-card-actions">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); window.location.href='mascota.html?id=${pet.id}'">
                        Ver detalles
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="event.stopPropagation(); this.contactOwner(${pet.id})">
                        Contactar
                    </button>
                </div>
            </div>
        `

    return card
  }

  // Abrir modal de mascota
  openPetModal(pet) {
    const modal = document.getElementById("petModal")
    const modalBody = document.getElementById("petModalBody")

    if (!modal || !modalBody) return

    modalBody.innerHTML = `
            <div class="pet-modal-header">
                <h2>${pet.name || "Sin nombre"}</h2>
                <div class="pet-modal-badges">
                    ${
                      pet.status === "activa"
                        ? '<span class="badge badge-success">Activo</span>'
                        : '<span class="badge badge-secondary">Resuelto</span>'
                    }
                    ${
                      pet.report_type === "perdida"
                        ? '<span class="badge badge-danger">Perdido</span>'
                        : '<span class="badge badge-warning">Encontrado</span>'
                    }
                </div>
            </div>
            <div class="pet-modal-content-body">
                <div class="pet-modal-image">
                    <img src="${pet.photo || "/placeholder.svg?height=300&width=400"}" alt="${pet.name || "Mascota"}">
                </div>
                <div class="pet-modal-info">
                    <div class="pet-info-item">
                        <i class="fas fa-paw"></i>
                        <span>Tipo: <strong>${this.capitalizeFirst(pet.animal_type)}</strong></span>
                    </div>
                    <div class="pet-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Fecha: <strong>${this.formatDate(pet.date)}</strong></span>
                    </div>
                    <div class="pet-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Ubicación: <strong>${pet.location}</strong></span>
                    </div>
                    <div class="pet-description">
                        <h4>Descripción</h4>
                        <p>${pet.description}</p>
                    </div>
                    <div class="pet-modal-actions">
                        <button class="btn btn-primary" onclick="window.location.href='mascota.html?id=${pet.id}'">
                            Ver detalles completos
                        </button>
                        <button class="btn btn-outline" onclick="patitaApp.contactOwner(${pet.id})">
                            Contactar
                        </button>
                    </div>
                </div>
            </div>
        `

    modal.style.display = "block"

    // Configurar botón de cerrar
    const closeBtn = modal.querySelector(".close-modal")
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal(modal)
    }
  }

  // Cerrar modal
  closeModal(modal) {
    modal.style.display = "none"
  }

  // Contactar propietario
  contactOwner(petId) {
    const user = this.getCurrentUser()
    if (!user) {
      alert("Debes iniciar sesión para contactar al propietario")
      window.location.href = "login.html"
      return
    }

    window.location.href = `mascota.html?id=${petId}#contact`
  }

  // Capitalizar primera letra
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  // Validar email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validar teléfono
  isValidPhone(phone) {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ""))
  }

  // Comprimir imagen
  async compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        canvas.toBlob(resolve, "image/jpeg", quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Obtener ubicación del usuario
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      )
    })
  }

  // Mostrar loading
  showLoading(element) {
    if (element) {
      element.innerHTML = '<div class="loading">Cargando...</div>'
    }
  }

  // Ocultar loading
  hideLoading(element) {
    const loading = element?.querySelector(".loading")
    if (loading) {
      loading.remove()
    }
  }
}

// Inicializar aplicación
const patitaApp = new PatitaApp()

// Funciones globales para compatibilidad
window.patitaApp = patitaApp