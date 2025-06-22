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
    const container = document.getElementById("petCardsContainer")
    if (!container) return

    try {
      await patitaApp.loadPetCards("petCardsContainer")
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

  //  llama a la API
async getStats() {
  try {
    const response = await fetch('get_stats.php'); 
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return {
      totalMascotas: 0,
      mascotasEncontradas: 0,
      totalUsuarios: 0,
    };
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
  const homePage = new HomePage()
}
