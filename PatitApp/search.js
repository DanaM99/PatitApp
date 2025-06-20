// Funcionalidad de la página de búsqueda
class SearchPage {
  constructor() {
    this.currentPage = 1
    this.itemsPerPage = 12
    this.currentFilters = {}
    this.currentView = "list"
    this.map = null
    this.markers = []
    this.init()
  }

  init() {
    this.setupEventListeners()
    this.setupMap()
    this.loadPets()
  }

  setupEventListeners() {
    // Formulario de búsqueda
    const searchForm = document.getElementById("searchForm")
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleSearch()
      })

      // Búsqueda en tiempo real
      const inputs = searchForm.querySelectorAll("input, select")
      inputs.forEach((input) => {
        input.addEventListener("change", () => {
          this.handleSearch()
        })
      })
    }

    // Limpiar filtros
    const clearFiltersBtn = document.getElementById("clearFiltersBtn")
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => {
        this.clearFilters()
      })
    }

    // Cambio de vista
    const listViewBtn = document.getElementById("listViewBtn")
    const mapViewBtn = document.getElementById("mapViewBtn")

    if (listViewBtn) {
      listViewBtn.addEventListener("click", () => {
        this.switchView("list")
      })
    }

    if (mapViewBtn) {
      mapViewBtn.addEventListener("click", () => {
        this.switchView("map")
      })
    }

    // Paginación
    const prevPageBtn = document.getElementById("prevPage")
    const nextPageBtn = document.getElementById("nextPage")

    if (prevPageBtn) {
      prevPageBtn.addEventListener("click", () => {
        if (this.currentPage > 1) {
          this.currentPage--
          this.loadPets()
        }
      })
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener("click", () => {
        this.currentPage++
        this.loadPets()
      })
    }

    // Modal de mascota
    const modal = document.getElementById("petModal")
    if (modal) {
      const closeBtn = modal.querySelector(".close-modal")
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          modal.style.display = "none"
        })
      }
    }
  }

  setupMap() {
    const mapContainer = document.getElementById("resultsMap")
    if (!mapContainer) return

    // Inicializar mapa
    this.map = L.map("resultsMap").setView([-34.6037, -58.3816], 11)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)
  }

  handleSearch() {
    this.currentPage = 1
    this.collectFilters()
    this.loadPets()
  }

  collectFilters() {
    const form = document.getElementById("searchForm")
    if (!form) return

    const formData = new FormData(form)
    this.currentFilters = {}

    for (const [key, value] of formData.entries()) {
      if (value.trim()) {
        this.currentFilters[key] = value.trim()
      }
    }
  }

  clearFilters() {
    const form = document.getElementById("searchForm")
    if (form) {
      form.reset()
    }

    this.currentFilters = {}
    this.currentPage = 1
    this.loadPets()
  }

  switchView(view) {
    this.currentView = view

    const listView = document.getElementById("listView")
    const mapView = document.getElementById("mapView")
    const listViewBtn = document.getElementById("listViewBtn")
    const mapViewBtn = document.getElementById("mapViewBtn")

    if (view === "list") {
      listView.style.display = "block"
      mapView.style.display = "none"
      listViewBtn.classList.add("active")
      mapViewBtn.classList.remove("active")
    } else {
      listView.style.display = "none"
      mapView.style.display = "block"
      listViewBtn.classList.remove("active")
      mapViewBtn.classList.add("active")

      // Actualizar mapa
      setTimeout(() => {
        this.map.invalidateSize()
        this.updateMapMarkers()
      }, 100)
    }
  }

  async loadPets() {
    const listView = document.getElementById("listView")
    const loadingElement = document.getElementById("loadingResults")
    const noResultsElement = document.getElementById("noResults")

    if (!listView) return

    try {
      // Mostrar loading
      if (loadingElement) {
        loadingElement.style.display = "block"
      }
      if (noResultsElement) {
        noResultsElement.style.display = "none"
      }

      // Limpiar resultados anteriores
      const existingCards = listView.querySelectorAll(".pet-card")
      existingCards.forEach((card) => card.remove())

      // Obtener datos
      const response = await this.searchPets(this.currentFilters, this.currentPage)

      // Ocultar loading
      if (loadingElement) {
        loadingElement.style.display = "none"
      }

      if (response.pets.length === 0) {
        if (noResultsElement) {
          noResultsElement.style.display = "block"
        }
        this.hidePagination()
        return
      }

      // Mostrar resultados
      response.pets.forEach((pet) => {
        const card = patitaApp.createPetCard(pet)
        listView.appendChild(card)
      })

      // Actualizar paginación
      this.updatePagination(response.totalPages, response.currentPage)

      // Actualizar mapa si está visible
      if (this.currentView === "map") {
        this.updateMapMarkers(response.pets)
      }
    } catch (error) {
      console.error("Error al cargar mascotas:", error)

      if (loadingElement) {
        loadingElement.style.display = "none"
      }

      listView.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los resultados</p>
                </div>
            `
    }
  }

  updateMapMarkers(pets = []) {
    if (!this.map) return

    // Limpiar marcadores anteriores
    this.markers.forEach((marker) => {
      this.map.removeLayer(marker)
    })
    this.markers = []

    // Agregar nuevos marcadores
    pets.forEach((pet) => {
      if (pet.latitude && pet.longitude) {
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div class="marker-content ${pet.report_type}">
                        <i class="fas fa-paw"></i>
                    </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        })

        const marker = L.marker([pet.latitude, pet.longitude], { icon })
          .addTo(this.map)
          .bindPopup(`
                        <div class="marker-popup">
                            <img src="${pet.photo || "/placeholder.svg?height=100&width=150"}" alt="${pet.name || "Mascota"}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                            <h4>${pet.name || "Sin nombre"}</h4>
                            <p><strong>${patitaApp.capitalizeFirst(pet.animal_type)}</strong> - ${pet.report_type === "perdida" ? "Perdido" : "Encontrado"}</p>
                            <p><i class="fas fa-map-marker-alt"></i> ${pet.location}</p>
                            <p><i class="fas fa-calendar-alt"></i> ${patitaApp.formatRelativeDate(pet.date)}</p>
                            <button class="btn btn-primary btn-sm" onclick="window.location.href='mascota.html?id=${pet.id}'">Ver detalles</button>
                        </div>
                    `)

        this.markers.push(marker)
      }
    })

    // Ajustar vista del mapa si hay marcadores
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers)
      this.map.fitBounds(group.getBounds().pad(0.1))
    }
  }

  updatePagination(totalPages, currentPage) {
    const pagination = document.getElementById("pagination")
    const pageInfo = document.getElementById("pageInfo")
    const prevBtn = document.getElementById("prevPage")
    const nextBtn = document.getElementById("nextPage")

    if (!pagination) return

    if (totalPages <= 1) {
      pagination.style.display = "none"
      return
    }

    pagination.style.display = "flex"

    if (pageInfo) {
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`
    }

    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages
    }
  }

  hidePagination() {
    const pagination = document.getElementById("pagination")
    if (pagination) {
      pagination.style.display = "none"
    }
  }

  // Simular búsqueda de mascotas
  async searchPets(filters = {}, page = 1) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Datos de prueba
    const allPets = [
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
        latitude: -34.5875,
        longitude: -58.3974,
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
        latitude: -34.5889,
        longitude: -58.3963,
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
        latitude: -34.5998,
        longitude: -58.4317,
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
        latitude: -34.6212,
        longitude: -58.3731,
        user_id: 2,
      },
      {
        id: 5,
        name: "Rocky",
        animal_type: "perro",
        report_type: "encontrada",
        location: "Belgrano, Buenos Aires",
        date: "2025-01-11",
        description: "Perro mestizo grande, muy cariñoso.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "activa",
        latitude: -34.5633,
        longitude: -58.4578,
        user_id: 1,
      },
      {
        id: 6,
        name: "Whiskers",
        animal_type: "gato",
        report_type: "perdida",
        location: "Caballito, Buenos Aires",
        date: "2025-01-10",
        description: "Gato atigrado con collar azul.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "activa",
        latitude: -34.6198,
        longitude: -58.4431,
        user_id: 2,
      },
    ]

    // Aplicar filtros
    const filteredPets = allPets.filter((pet) => {
      if (filters.reportType && pet.report_type !== filters.reportType) {
        return false
      }
      if (filters.animalType && pet.animal_type !== filters.animalType) {
        return false
      }
      if (filters.status && pet.status !== filters.status) {
        return false
      }
      if (filters.zone && !pet.location.toLowerCase().includes(filters.zone.toLowerCase())) {
        return false
      }
      if (filters.dateFrom && pet.date < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && pet.date > filters.dateTo) {
        return false
      }
      return true
    })

    // Paginación
    const totalItems = filteredPets.length
    const totalPages = Math.ceil(totalItems / this.itemsPerPage)
    const startIndex = (page - 1) * this.itemsPerPage
    const endIndex = startIndex + this.itemsPerPage
    const paginatedPets = filteredPets.slice(startIndex, endIndex)

    return {
      pets: paginatedPets,
      totalItems,
      totalPages,
      currentPage: page,
      itemsPerPage: this.itemsPerPage,
    }
  }
}

// Inicializar página de búsqueda si estamos en ella
if (document.getElementById("searchForm")) {
  // Assuming L and patitaApp are global variables provided by other scripts
  const searchPage = new SearchPage()
}

// Estilos CSS para marcadores personalizados
const markerStyles = `
<style>
.custom-marker {
    background: none;
    border: none;
}

.marker-content {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.marker-content.perdida {
    background-color: #ef476f;
}

.marker-content.encontrada {
    background-color: #ffd166;
    color: #333;
}

.marker-popup {
    min-width: 200px;
}

.marker-popup h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
}

.marker-popup p {
    margin: 4px 0;
    font-size: 14px;
}

.marker-popup .btn {
    margin-top: 8px;
}
</style>
`

// Agregar estilos al head
document.head.insertAdjacentHTML("beforeend", markerStyles)