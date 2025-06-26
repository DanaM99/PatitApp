document.addEventListener("DOMContentLoaded", () => {
  const petContainer = document.getElementById("listView");
  const paginationContainer = document.getElementById("pagination");
  const filtersForm = document.getElementById("searchForm");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  const allViewBtn = document.getElementById("allViewBtn");
  const listViewBtn = document.getElementById("listViewBtn");
  const mapViewBtn = document.getElementById("mapViewBtn");

  const app = {
    allPets: [],
    currentPage: 1,
    itemsPerPage: 12,
    currentStatus: null, // Mostrar todos por defecto

    async init() {
      this.bindEvents();
      await this.fetchAllPets();
      await this.cargarZonas();
      this.setActiveButton(allViewBtn); // Activar botón "Todas" por defecto
      this.renderPets();
    },

    bindEvents() {
      if (filtersForm) {
        filtersForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.currentPage = 1;
          this.renderPets();
        });
      }

      if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", () => {
          filtersForm.reset();
          this.currentPage = 1;
          this.renderPets();
        });
      }

      allViewBtn.addEventListener("click", () => {
        this.currentStatus = null;
        this.setActiveButton(allViewBtn);
        document.getElementById("listView").style.display = "grid";
        document.getElementById("mapView").style.display = "none";
        this.currentPage = 1;
        this.renderPets();
      });

      listViewBtn.addEventListener("click", () => {
        this.currentStatus = "1"; // Activo
        this.setActiveButton(listViewBtn);
        document.getElementById("listView").style.display = "grid";
        document.getElementById("mapView").style.display = "none";
        this.currentPage = 1;
        this.renderPets();
      });

      mapViewBtn.addEventListener("click", () => {
        this.currentStatus = "2"; // Resuelto
        this.setActiveButton(mapViewBtn);
        document.getElementById("listView").style.display = "grid";
        document.getElementById("mapView").style.display = "none";
        this.currentPage = 1;
        this.renderPets();
      });
    },

    setActiveButton(activeBtn) {
      [allViewBtn, listViewBtn, mapViewBtn].forEach((btn) =>
        btn.classList.remove("active")
      );
      activeBtn.classList.add("active");
    },

    async fetchAllPets() {
      try {
        const response = await fetch("get_todas_las_mascotas.php");
        const data = await response.json();
        this.allPets = data;
      } catch (error) {
        console.error("❌ Error al obtener las mascotas:", error);
        this.allPets = [];
      }
    },

    async cargarZonas() {
      try {
        const response = await fetch("get_zonas.php");
        const zonas = await response.json();
        const select = document.getElementById("filterZone");

        zonas.forEach((zona) => {
          const option = document.createElement("option");
          option.value = zona.nombre.toLowerCase();
          option.textContent = zona.nombre;
          select.appendChild(option);
        });
      } catch (error) {
        console.error("❌ Error al cargar zonas:", error);
      }
    },

    getFilters() {
      const filters = {};
      const formElements = filtersForm.elements;
      for (const input of formElements) {
        if (input.name && input.value) {
          filters[input.name] = input.value.toLowerCase();
        }
      }
      return filters;
    },

    renderPets() {
      petContainer.innerHTML = "";

      const filters = this.getFilters();

      let filteredPets = this.allPets.filter((pet) => {
        let cumple = true;

        if (filters.reportType && pet.report_type.toLowerCase() !== filters.reportType) {
          cumple = false;
        }

        if (filters.animalType && pet.animal_type.toLowerCase() !== filters.animalType) {
          cumple = false;
        }

        if (filters.zone && pet.zona_nombre.toLowerCase() !== filters.zone) {
          cumple = false;
        }

        if (this.currentStatus && pet.idEstadoReporte.toString() !== this.currentStatus) {
          cumple = false;
        }

        return cumple;
      });

      const totalPages = Math.ceil(filteredPets.length / this.itemsPerPage);
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      const petsToShow = filteredPets.slice(start, end);

      if (petsToShow.length === 0) {
        petContainer.innerHTML = `
          <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No se encontraron resultados</h3>
            <p>Intenta con otros filtros o <a href="publicar.html">publica un reporte</a></p>
          </div>`;
        paginationContainer.style.display = "none";
        return;
      }

      petsToShow.forEach((pet) => {
        const card = patitaApp.createPetCard(pet);
        petContainer.appendChild(card);
      });

      this.renderPagination(totalPages);
    },

    renderPagination(totalPages) {
      paginationContainer.innerHTML = "";
      paginationContainer.style.display = totalPages > 1 ? "flex" : "none";

      for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = i === this.currentPage ? "active" : "";
        button.addEventListener("click", () => {
          this.currentPage = i;
          this.renderPets();
        });
        paginationContainer.appendChild(button);
      }
    },
  };

  app.init();
});