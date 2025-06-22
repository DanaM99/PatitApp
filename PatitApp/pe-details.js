// Funcionalidad de la página de detalle de mascota
class PetDetailPage {
  constructor() {
    this.petId = null;
    this.pet = null;
    this.map = null;
    this.init();
  }

  init() {
    this.getPetIdFromUrl();
    this.setupEventListeners();
    this.loadPetDetail();
  }

  getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    this.petId = urlParams.get("id");

    if (!this.petId) {
      this.showPetNotFound();
      return;
    }
  }

  setupEventListeners() {
    const contactForm = document.getElementById("sendMessageForm");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        this.handleContactSubmit(e);
      });
    }
  }

  async loadPetDetail() {
    const loadingEl = document.getElementById("loadingPet");
    const petNotFoundEl = document.getElementById("petNotFound");
    const petDetailEl = document.getElementById("petDetail");

    try {
      if (loadingEl) loadingEl.style.display = "block";
      if (petNotFoundEl) petNotFoundEl.style.display = "none";
      if (petDetailEl) petDetailEl.style.display = "none";

      // Obtener datos reales de la API
      this.pet = await this.getPetById(this.petId);

      if (!this.pet || this.pet.error) {
        this.showPetNotFound();
        return;
      }

      this.displayPetDetail();
      this.initMap();
    } catch (error) {
      console.error("Error al cargar mascota:", error);
      this.showPetNotFound();
    } finally {
      if (loadingEl) loadingEl.style.display = "none";
    }
  }

  showPetNotFound() {
    const loadingEl = document.getElementById("loadingPet");
    const petNotFoundEl = document.getElementById("petNotFound");
    const petDetailEl = document.getElementById("petDetail");

    if (loadingEl) loadingEl.style.display = "none";
    if (petNotFoundEl) petNotFoundEl.style.display = "block";
    if (petDetailEl) petDetailEl.style.display = "none";
  }

  displayPetDetail() {
    const petDetailEl = document.getElementById("petDetail");
    if (!petDetailEl || !this.pet) return;

    // Elementos principales
    const petName = document.getElementById("petName");
    const petImage = document.getElementById("petImage");
    const petLocation = document.getElementById("petLocation");
    const petDescription = document.getElementById("petDescription");
    const petDate = document.getElementById("petDate");
    const petType = document.getElementById("petType");
    const petStatus = document.getElementById("petStatus");
    const contactPhone = document.getElementById("contactPhone");

    // Mostrar datos reales
    if (petName) petName.textContent = this.pet.name || "Sin nombre";
    if (petImage) petImage.src = this.pet.photo || "img/placeholder-pet.png";
    if (petLocation) petLocation.textContent = this.pet.location || "Ubicación no especificada";
    if (petDescription) petDescription.textContent = this.pet.description || "No hay descripción disponible";
    if (petDate) petDate.textContent = this.formatDate(this.pet.date) || "Fecha no especificada";
    if (petType) petType.textContent = this.pet.animal_type || "Tipo no especificado";
    
    // Mostrar estado (traducido si es necesario)
    if (petStatus) {
      petStatus.textContent = this.pet.status === "resuelto" ? "Resuelto" : "Activo";
      petStatus.className = this.pet.status === "resuelto" ? "badge badge-secondary" : "badge badge-success";
    }
    
    if (contactPhone) {
      contactPhone.textContent = this.pet.telefonoContacto || "No disponible";
      if (this.pet.telefonoContacto) {
        contactPhone.href = `tel:${this.pet.telefonoContacto}`;
      }
    }

    petDetailEl.style.display = "block";
  }

  async handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const messageEl = document.getElementById("contactMessage");
    
    try {
      // Enviar mensaje real a la API
      const response = await fetch('send_message.php', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        messageEl.textContent = "Mensaje enviado correctamente";
        messageEl.className = "alert alert-success";
        form.reset();
      } else {
        throw new Error(result.message || "Error al enviar el mensaje");
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      messageEl.textContent = error.message || "Error al enviar el mensaje";
      messageEl.className = "alert alert-danger";
    }
    
    messageEl.style.display = "block";
    setTimeout(() => {
      messageEl.style.display = "none";
    }, 5000);
  }

  async getPetById(id) {
    try {
      const response = await fetch(`get_reporte.php?id=${id}`);
      if (!response.ok) throw new Error("Error al obtener el reporte");
      const data = await response.json();
      
      // Verificar si la respuesta contiene datos válidos
      if (!data || data.error) {
        throw new Error(data.error || "Datos no válidos recibidos");
      }
      
      return data;
    } catch (error) {
      console.error("Error en getPetById:", error);
      return null;
    }
  }

  initMap() {
    if (!this.pet || !this.pet.ubicacion) return;
    
    // Implementación básica del mapa (requiere integración con Google Maps o similar)
    const mapContainer = document.getElementById("petMap");
    if (!mapContainer) return;
    
    // Aquí iría la lógica para inicializar el mapa con la ubicación real
    mapContainer.innerHTML = `<div class="map-placeholder">
      <i class="fas fa-map-marker-alt"></i>
      <p>Mapa de ubicación: ${this.pet.location}</p>
    </div>`;
  }

  formatDate(dateString) {
    if (!dateString) return "Fecha no especificada";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  }
}

// Inicializar solo si estamos en la página de detalle
if (document.getElementById("petDetail")) {
  const petDetailPage = new PetDetailPage();
}

// Mantener compatibilidad con el objeto global
window.patitaApp = window.patitaApp || {};