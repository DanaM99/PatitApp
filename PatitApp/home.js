// Funcionalidad específica de la página de inicio de PatitApp
class HomePage {
  constructor() {
    this.init()
  }

  init() {
    this.loadRecentPosts()
    this.loadStats()
    this.setupEventListeners()
  }

  setupEventListeners() {
    // Configurar parámetros de URL para botones de hero
    const urlParams = new URLSearchParams(window.location.search)
    const tipo = urlParams.get("tipo")

    if (tipo) {
      // Redirigir a página de publicar con tipo específico
      window.location.href = `publicar.html?tipo=${tipo}`
    }
  }

  async loadRecentPosts() {
    const container = document.getElementById("recentPosts")
    if (!container) return

    try {
      patitaApp.showLoading(container)

      // Simular carga de publicaciones recientes
      const posts = await this.getRecentPosts()

      container.innerHTML = ""

      if (posts.length === 0) {
        container.innerHTML = `
                    <div class="no-posts">
                        <i class="fas fa-paw"></i>
                        <h3>No hay publicaciones recientes</h3>
                        <p>Sé el primero en <a href="publicar.html">publicar un reporte</a></p>
                    </div>
                `
        return
      }

      posts.forEach((post) => {
        const card = patitaApp.createPetCard(post)
        container.appendChild(card)
      })
    } catch (error) {
      console.error("Error al cargar publicaciones:", error)
      container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar las publicaciones</p>
                </div>
            `
    }
  }

  async loadStats() {
    try {
      const stats = await this.getStats()

      const totalMascotasEl = document.getElementById("totalMascotas")
      const mascotasEncontradasEl = document.getElementById("mascotasEncontradas")
      const totalUsuariosEl = document.getElementById("totalUsuarios")

      if (totalMascotasEl) {
        this.animateCounter(totalMascotasEl, stats.totalMascotas)
      }
      if (mascotasEncontradasEl) {
        this.animateCounter(mascotasEncontradasEl, stats.mascotasEncontradas)
      }
      if (totalUsuariosEl) {
        this.animateCounter(totalUsuariosEl, stats.totalUsuarios)
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error)
    }
  }

  // Simular obtención de publicaciones recientes
  async getRecentPosts() {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return [
      {
        id: 1,
        name: "Max",
        animal_type: "perro",
        report_type: "perdida",
        location: "Palermo, Buenos Aires",
        date: "2025-01-15",
        description: "Perro golden retriever, muy amigable. Se perdió en el parque.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "activa",
        user_id: 1,
      },
      {
        id: 2,
        name: "Luna",
        animal_type: "gato",
        report_type: "encontrada",
        location: "Recoleta, Buenos Aires",
        date: "2025-01-14",
        description: "Gata siamesa encontrada cerca del cementerio.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "activa",
        user_id: 2,
      },
      {
        id: 3,
        name: "Toby",
        animal_type: "perro",
        report_type: "perdida",
        location: "Villa Crespo, Buenos Aires",
        date: "2025-01-13",
        description: "Perro pequeño, color marrón, con collar rojo.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "activa",
        user_id: 1,
    },
    {
        id: 4,
        name: "Mimi",
        animal_type: "gato",
        report_type: "perdida",
        location: "San Telmo, Buenos Aires",
        date: "2025-01-12",
        description: "Gata negra con manchas blancas, muy tímida.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "resuelta",
        user_id: 2,
      },
    ]
  }

  // Simular obtención de estadísticas
  async getStats() {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      totalMascotas: 247,
      mascotasEncontradas: 189,
      totalUsuarios: 156,
    }
  }

  // Animar contador
  animateCounter(element, target) {
    let current = 0
    const increment = target / 50
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      element.textContent = Math.floor(current)
    }, 30)
  }
}

// Inicializar página de inicio si estamos en ella
if (document.querySelector(".hero")) {
  // Assuming patitaApp is defined elsewhere, likely in a separate script
  // For demonstration purposes, let's define a minimal version here.
  window.patitaApp = window.patitaApp || {
    showLoading: (container) => {
      container.innerHTML = "<p>Loading...</p>"
    },
    createPetCard: (post) => {
      const card = document.createElement("div")
      card.textContent = post.name // Simplified for brevity
      return card
    },
  }
  const homePage = new HomePage()
}