document.addEventListener("DOMContentLoaded", () => {
  const petContainer = document.getElementById("petCardsContainer")
  const paginationContainer = document.getElementById("pagination")
  const filtersForm = document.getElementById("filtersForm")

  const app = {
    currentPage: 1,
    itemsPerPage: 12,

    async init() {
      this.bindEvents()
      await this.renderPets()
    },

    bindEvents() {
      if (filtersForm) {
        filtersForm.addEventListener("submit", async (e) => {
          e.preventDefault()
          this.currentPage = 1
          await this.renderPets()
        })
      }
    },

    async fetchPets(filters = {}, page = 1) {
      try {
        const formData = new FormData()
        formData.append("page", page)

        for (const key in filters) {
          formData.append(key, filters[key])
        }

        const response = await fetch("get_reportes.php", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.message || "Error al obtener los reportes")
        }

        return {
          pets: data.reportes,
          totalItems: data.totalItems || data.reportes.length,
          totalPages: data.totalPages || 1,
          currentPage: page,
        }
      } catch (error) {
        console.error("❌ Error al buscar reportes reales:", error)
        return {
          pets: [],
          totalItems: 0,
          totalPages: 1,
          currentPage: page,
        }
      }
    },

    getFilters() {
      const filters = {}
      const formElements = filtersForm.elements
      for (const input of formElements) {
        if (input.name && input.value) {
          filters[input.name] = input.value
        }
      }
      return filters
    },

    async renderPets() {
      if (!petContainer) return
      petitaApp.showLoading(petContainer)

      const filters = this.getFilters()
      const { pets, totalPages, currentPage } = await this.fetchPets(filters, this.currentPage)

      petitaApp.hideLoading(petContainer)
      petContainer.innerHTML = ""

      if (pets.length === 0) {
        petContainer.innerHTML = "<p>No se encontraron resultados.</p>"
        paginationContainer.innerHTML = ""
        return
      }

      pets.forEach((pet) => {
        const card = patitaApp.createPetCard(pet)
        petContainer.appendChild(card)
      })

      this.renderPagination(totalPages, currentPage)
    },

    renderPagination(totalPages, currentPage) {
      paginationContainer.innerHTML = ""

      for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button")
        button.textContent = i
        button.className = i === currentPage ? "active" : ""
        button.addEventListener("click", () => {
          this.currentPage = i
          this.renderPets()
        })
        paginationContainer.appendChild(button)
      }
    },
  }

  app.init()
})