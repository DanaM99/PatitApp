// Funcionalidad de la página de detalle de mascota
class PetDetailPage {
  constructor() {
    this.petId = null
    this.pet = null
    this.map = null
    this.init()
  }

  init() {
    this.getPetIdFromUrl()
    this.setupEventListeners()
    this.loadPetDetail()
  }

  getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search)
    this.petId = urlParams.get("id")

    if (!this.petId) {
      this.showPetNotFound()
      return
    }
  }

  setupEventListeners() {
    // Formulario de contacto
    const contactForm = document.getElementById("sendMessageForm")
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        this.handleContactSubmit(e)
      })
    }

    // Botones de acción (solo para el propietario)
    const markResolvedBtn = document.getElementById("markResolvedBtn")
    const editPetBtn = document.getElementById("editPetBtn")
    const deletePetBtn = document.getElementById("deletePetBtn")

    if (markResolvedBtn) {
      markResolvedBtn.addEventListener("click", () => {
        this.markAsResolved()
      })
    }

    if (editPetBtn) {
      editPetBtn.addEventListener("click", () => {
        window.location.href = `publicar.html?edit=${this.petId}`
      })
    }

    if (deletePetBtn) {
      deletePetBtn.addEventListener("click", () => {
        this.deletePet()
      })
    }

    // Modal de confirmación
    this.setupConfirmationModal()
  }

  setupConfirmationModal() {
    const modal = document.getElementById("confirmationModal")
    const cancelBtn = document.getElementById("cancelConfirmation")
    const confirmBtn = document.getElementById("confirmAction")

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        modal.style.display = "none"
      })
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => {
        const action = confirmBtn.getAttribute("data-action")
        if (action === "delete") {
          this.confirmDeletePet()
        } else if (action === "resolve") {
          this.confirmMarkAsResolved()
        }
        modal.style.display = "none"
      })
    }
  }

  async loadPetDetail() {
    const loadingEl = document.getElementById("loadingPet")
    const petNotFoundEl = document.getElementById("petNotFound")
    const petDetailEl = document.getElementById("petDetail")

    try {
      if (loadingEl) loadingEl.style.display = "block"
      if (petNotFoundEl) petNotFoundEl.style.display = "none"
      if (petDetailEl) petDetailEl.style.display = "none"

      this.pet = await this.getPetById(this.petId)

      if (!this.pet) {
        this.showPetNotFound()
        return
      }

      this.displayPetDetail()
      this.setupMap()
      this.loadSimilarPets()
      this.setupOwnerActions()
    } catch (error) {
      console.error("Error al cargar mascota:", error)
      this.showPetNotFound()
    } finally {
      if (loadingEl) loadingEl.style.display = "none"
    }
  }

  showPetNotFound() {
    const loadingEl = document.getElementById("loadingPet")
    const petNotFoundEl = document.getElementById("petNotFound")
    const petDetailEl = document.getElementById("petDetail")

    if (loadingEl) loadingEl.style.display = "none"
    if (petNotFoundEl) petNotFoundEl.style.display = "block"
    if (petDetailEl) petDetailEl.style.display = "none"
  }

  displayPetDetail() {
    const petDetailEl = document.getElementById("petDetail")
    if (!petDetailEl || !this.pet) return

    // Actualizar elementos
    const petStatus = document.getElementById("petStatus")
    const petType = document.getElementById("petType")
    const petImage = document.getElementById("petImage")
    const petName = document.getElementById("petName")
    const petAnimalType = document.getElementById("petAnimalType")
    const petDate = document.getElementById("petDate")
    const petLocation = document.getElementById("petLocation")
    const petDescription = document.getElementById("petDescription")
    const contactName = document.getElementById("contactName")
    const contactEmail = document.getElementById("contactEmail")
    const contactPhone = document.getElementById("contactPhone")
    const contactPhoneContainer = document.getElementById("contactPhoneContainer")
    const petId = document.getElementById("petId")

    if (petStatus) {
      petStatus.innerHTML =
        this.pet.status === "activa"
          ? '<span class="status-badge active">Activo</span>'
          : '<span class="status-badge resolved">Resuelto</span>'
    }

    if (petType) {
      petType.innerHTML =
        this.pet.report_type === "perdida"
          ? '<span class="type-badge lost">Perdido</span>'
          : '<span class="type-badge found">Encontrado</span>'
    }

    if (petImage) {
      petImage.src = this.pet.photo || "/placeholder.svg?height=400&width=400"
      petImage.alt = this.pet.name || "Mascota"
    }

    if (petName) {
      petName.textContent = this.pet.name || "Sin nombre"
    }

    if (petAnimalType) {
      petAnimalType.textContent = patitaApp.capitalizeFirst(this.pet.animal_type)
    }

    if (petDate) {
      petDate.textContent = patitaApp.formatDate(this.pet.date)
    }

    if (petLocation) {
      petLocation.textContent = this.pet.location
    }

    if (petDescription) {
      petDescription.textContent = this.pet.description
    }

    if (contactName) {
      contactName.textContent = this.pet.user_name || "Usuario"
    }

    if (contactEmail) {
      contactEmail.textContent = this.pet.user_email || "No disponible"
    }

    if (contactPhone && contactPhoneContainer) {
      if (this.pet.contact_phone) {
        contactPhone.textContent = this.pet.contact_phone
        contactPhoneContainer.style.display = "flex"
      } else {
        contactPhoneContainer.style.display = "none"
      }
    }

    if (petId) {
      petId.value = this.pet.id
    }

    petDetailEl.style.display = "block"
  }

  setupMap() {
    if (!this.pet || !this.pet.latitude || !this.pet.longitude) return

    const mapContainer = document.getElementById("petLocationMap")
    if (!mapContainer) return

    this.map = L.map("petLocationMap").setView([this.pet.latitude, this.pet.longitude], 15)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    // Agregar marcador
    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div class="marker-content ${this.pet.report_type}">
                <i class="fas fa-paw"></i>
            </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    L.marker([this.pet.latitude, this.pet.longitude], { icon })
      .addTo(this.map)
      .bindPopup(`
                <div class="marker-popup">
                    <h4>${this.pet.name || "Sin nombre"}</h4>
                    <p><strong>${patitaApp.capitalizeFirst(this.pet.animal_type)}</strong></p>
                    <p>${this.pet.report_type === "perdida" ? "Se perdió aquí" : "Se encontró aquí"}</p>
                </div>
            `)
      .openPopup()
  }

  setupOwnerActions() {
    const user = patitaApp.getCurrentUser()
    const petActions = document.getElementById("petActions")

    if (!user || !this.pet || user.id !== this.pet.user_id) {
      if (petActions) {
        petActions.style.display = "none"
      }
      return
    }

    if (petActions) {
      petActions.style.display = "flex"
    }

    // Ocultar botón de marcar como resuelto si ya está resuelto
    const markResolvedBtn = document.getElementById("markResolvedBtn")
    if (markResolvedBtn && this.pet.status === "resuelta") {
      markResolvedBtn.style.display = "none"
    }
  }

  async loadSimilarPets() {
    if (!this.pet) return

    const similarPetsSection = document.getElementById("similarPetsSection")
    const similarPetsContainer = document.getElementById("similarPets")

    if (!similarPetsContainer) return

    try {
      const similarPets = await this.getSimilarPets()

      if (similarPets.length === 0) {
        if (similarPetsSection) {
          similarPetsSection.style.display = "none"
        }
        return
      }

      similarPetsContainer.innerHTML = ""

      similarPets.forEach((pet) => {
        const card = patitaApp.createPetCard(pet)
        similarPetsContainer.appendChild(card)
      })

      if (similarPetsSection) {
        similarPetsSection.style.display = "block"
      }
    } catch (error) {
      console.error("Error al cargar mascotas similares:", error)
    }
  }

  async handleContactSubmit(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const errorElement = document.getElementById("contactError")
    const successElement = document.getElementById("contactSuccess")

    // Validaciones
    const senderName = formData.get("senderName")
    const senderEmail = formData.get("senderEmail")
    const messageContent = formData.get("messageContent")

    if (!senderName.trim()) {
      patitaApp.showAlert(errorElement, "Ingresa tu nombre")
      return
    }

    if (!senderEmail.trim() || !patitaApp.isValidEmail(senderEmail)) {
      patitaApp.showAlert(errorElement, "Ingresa un email válido")
      return
    }

    if (!messageContent.trim()) {
      patitaApp.showAlert(errorElement, "Ingresa un mensaje")
      return
    }

    try {
      const submitBtn = form.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Enviando..."
      submitBtn.disabled = true

      const response = await this.sendContactMessage(formData)

      if (response.success) {
        patitaApp.showAlert(successElement, "Mensaje enviado correctamente", "success")
        form.reset()
      } else {
        patitaApp.showAlert(errorElement, response.message)
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error)
      patitaApp.showAlert(errorElement, "Error al enviar el mensaje")
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.textContent = "Enviar mensaje"
      submitBtn.disabled = false
    }
  }

  markAsResolved() {
    const modal = document.getElementById("confirmationModal")
    const title = document.getElementById("confirmationTitle")
    const message = document.getElementById("confirmationMessage")
    const confirmBtn = document.getElementById("confirmAction")

    if (title) title.textContent = "¿Marcar como resuelto?"
    if (message) message.textContent = "¿Estás seguro de que quieres marcar esta publicación como resuelta?"
    if (confirmBtn) {
      confirmBtn.setAttribute("data-action", "resolve")
      confirmBtn.textContent = "Marcar como resuelto"
      confirmBtn.className = "btn btn-success"
    }

    if (modal) modal.style.display = "block"
  }

  deletePet() {
    const modal = document.getElementById("confirmationModal")
    const title = document.getElementById("confirmationTitle")
    const message = document.getElementById("confirmationMessage")
    const confirmBtn = document.getElementById("confirmAction")

    if (title) title.textContent = "¿Eliminar publicación?"
    if (message) message.textContent = "Esta acción no se puede deshacer. ¿Estás seguro?"
    if (confirmBtn) {
      confirmBtn.setAttribute("data-action", "delete")
      confirmBtn.textContent = "Eliminar"
      confirmBtn.className = "btn btn-danger"
    }

    if (modal) modal.style.display = "block"
  }

  async confirmMarkAsResolved() {
    try {
      const response = await this.updatePetStatus("resuelta")

      if (response.success) {
        alert("Publicación marcada como resuelta")
        window.location.reload()
      } else {
        alert("Error al actualizar la publicación")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar la publicación")
    }
  }

  async confirmDeletePet() {
    try {
      const response = await this.deletePetRecord()

      if (response.success) {
        alert("Publicación eliminada correctamente")
        window.location.href = "panel.html"
      } else {
        alert("Error al eliminar la publicación")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar la publicación")
    }
  }

  // Simular obtención de mascota por ID
  async getPetById(id) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const pets = [
      {
        id: 1,
        name: "Max",
        animal_type: "perro",
        report_type: "perdida",
        location: "Palermo, Buenos Aires",
        date: "2025-01-15",
        description:
          "Perro golden retriever, muy amigable. Se perdió en el parque mientras jugaba. Es muy sociable con otros perros y personas. Responde a su nombre y le gusta jugar con pelotas.",
        photo: "/placeholder.svg?height=400&width=400",
        status: "activa",
        latitude: -34.5875,
        longitude: -58.3974,
        user_id: 1,
        user_name: "Juan Pérez",
        user_email: "juan@ejemplo.com",
        contact_phone: "+54 11 1234-5678",
      },
      {
        id: 2,
        name: "Luna",
        animal_type: "gato",
        report_type: "encontrada",
        location: "Recoleta, Buenos Aires",
        date: "2025-01-14",
        description:
          "Gata siamesa encontrada cerca del cementerio. Parece estar bien cuidada, probablemente tiene dueño. Es muy cariñosa y se deja acariciar.",
        photo: "/placeholder.svg?height=400&width=400",
        status: "activa",
        latitude: -34.5889,
        longitude: -58.3963,
        user_id: 2,
        user_name: "María García",
        user_email: "maria@ejemplo.com",
        contact_phone: null,
      },
    ]

    return pets.find((pet) => pet.id == id) || null
  }

  // Simular obtención de mascotas similares
  async getSimilarPets() {
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!this.pet) return []

    // Simular mascotas similares basadas en tipo y ubicación
    const similarPets = [
      {
        id: 3,
        name: "Toby",
        animal_type: "perro",
        report_type: "perdida",
        location: "Villa Crespo, Buenos Aires",
        date: "2025-01-13",
        description: "Perro pequeño, color marrón.",
        photo: "/placeholder.svg?height=200&width=280",
        status: "activa",
        user_id: 1,
      },
    ]

    return similarPets.filter((pet) => pet.id !== this.pet.id && pet.animal_type === this.pet.animal_type)
  }

  // Simular envío de mensaje de contacto
  async sendContactMessage(formData) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "Mensaje enviado correctamente",
    }
  }

  // Simular actualización de estado
  async updatePetStatus(status) {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Estado actualizado",
    }
  }

  // Simular eliminación de mascota
  async deletePetRecord() {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: "Publicación eliminada",
    }
  }
}

// Inicializar página de detalle si estamos en ella
if (document.getElementById("petDetail")) {
  const petDetailPage = new PetDetailPage()
}

const patitaApp = window.patitaApp || {}
const L = window.L