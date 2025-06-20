// Funcionalidad de la página de publicación
class PublishPage {
  constructor() {
    this.map = null
    this.marker = null
    this.init()
  }

  init() {
    this.checkAuth()
    this.setupForm()
    this.setupMap()
    this.setupEventListeners()
    this.handleUrlParams()
  }

  checkAuth() {
    if (!authManager.isAuthenticated()) {
      document.getElementById("authRequiredMessage").style.display = "block"
      document.getElementById("publishFormContainer").style.display = "none"
      return
    }

    document.getElementById("authRequiredMessage").style.display = "none"
    document.getElementById("publishFormContainer").style.display = "block"
  }

  setupForm() {
    const form = document.getElementById("publishForm")
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e))
    }

    // Configurar selector de tipo de animal
    const animalTypeSelect = document.getElementById("animalType")
    const otherAnimalTypeGroup = document.getElementById("otherAnimalTypeGroup")

    if (animalTypeSelect) {
      animalTypeSelect.addEventListener("change", (e) => {
        if (e.target.value === "otro") {
          otherAnimalTypeGroup.style.display = "block"
          document.getElementById("otherAnimalType").required = true
        } else {
          otherAnimalTypeGroup.style.display = "none"
          document.getElementById("otherAnimalType").required = false
        }
      })
    }

    // Configurar preview de foto
    const photoInput = document.getElementById("petPhoto")
    const photoPreview = document.getElementById("photoPreview")

    if (photoInput && photoPreview) {
      photoInput.addEventListener("change", (e) => {
        this.handlePhotoUpload(e, photoPreview)
      })
    }

    // Configurar fecha máxima (hoy)
    const dateInput = document.getElementById("lostDate")
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0]
      dateInput.max = today
      dateInput.value = today
    }
  }

  setupMap() {
    const mapContainer = document.getElementById("mapContainer")
    if (!mapContainer) return

    // Inicializar mapa con Leaflet
    this.map = L.map("mapContainer").setView([-34.6037, -58.3816], 12) // Buenos Aires

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map)

    // Agregar evento de clic en el mapa
    this.map.on("click", (e) => {
      this.setMapLocation(e.latlng.lat, e.latlng.lng)
    })

    // Intentar obtener ubicación actual
    this.getCurrentLocationForMap()
  }

  setupEventListeners() {
    // Botón usar mi ubicación
    const useLocationBtn = document.getElementById("useMyLocationBtn")
    if (useLocationBtn) {
      useLocationBtn.addEventListener("click", () => {
        this.getCurrentLocationForMap()
      })
    }

    // Cambio en tipo de reporte
    const reportTypeInputs = document.querySelectorAll('input[name="reportType"]')
    reportTypeInputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        this.updateFormForReportType(e.target.value)
      })
    })
  }

  handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search)
    const tipo = urlParams.get("tipo")

    if (tipo === "perdida" || tipo === "encontrada") {
      const radioButton = document.getElementById(tipo === "perdida" ? "typeLost" : "typeFound")
      if (radioButton) {
        radioButton.checked = true
        this.updateFormForReportType(tipo)
      }
    }
  }

  updateFormForReportType(type) {
    const title = document.getElementById("publishTitle")
    if (title) {
      title.textContent = type === "perdida" ? "Reportar mascota perdida" : "Reportar mascota encontrada"
    }

    // Actualizar etiquetas de fecha
    const dateLabel = document.querySelector('label[for="lostDate"]')
    if (dateLabel) {
      dateLabel.textContent = type === "perdida" ? "Fecha en que se perdió" : "Fecha en que se encontró"
    }
  }

  async getCurrentLocationForMap() {
    try {
      const position = await patitaApp.getCurrentLocation()
      this.setMapLocation(position.latitude, position.longitude)

      // Actualizar campo de ubicación con geocodificación inversa
      this.reverseGeocode(position.latitude, position.longitude)
    } catch (error) {
      console.error("Error al obtener ubicación:", error)
      alert("No se pudo obtener tu ubicación. Por favor, selecciona manualmente en el mapa.")
    }
  }

  setMapLocation(lat, lng) {
    // Remover marcador anterior
    if (this.marker) {
      this.map.removeLayer(this.marker)
    }

    // Agregar nuevo marcador
    this.marker = L.marker([lat, lng]).addTo(this.map)

    // Centrar mapa
    this.map.setView([lat, lng], 15)

    // Actualizar campos ocultos
    document.getElementById("latitude").value = lat
    document.getElementById("longitude").value = lng
  }

  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      const data = await response.json()

      if (data && data.display_name) {
        const locationInput = document.getElementById("location")
        if (locationInput && !locationInput.value) {
          // Extraer información relevante
          const parts = data.display_name.split(",")
          const relevantParts = parts.slice(0, 3).join(", ")
          locationInput.value = relevantParts
        }
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error)
    }
  }

  handlePhotoUpload(event, previewElement) {
    const file = event.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido")
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 5MB.")
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      previewElement.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
            `
    }
    reader.readAsDataURL(file)
  }

  async handleSubmit(event) {
    event.preventDefault()

    const form = event.target
    const formData = new FormData(form)
    const errorElement = document.getElementById("publishError")
    const successElement = document.getElementById("publishSuccess")

    // Validaciones adicionales
    if (!this.validateForm(formData, errorElement)) {
      return
    }

    try {
      // Mostrar loading
      const submitBtn = form.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Publicando..."
      submitBtn.disabled = true

      // Comprimir imagen si es necesaria
      const photoFile = formData.get("petPhoto")
      if (photoFile && photoFile.size > 0) {
        const compressedPhoto = await patitaApp.compressImage(photoFile)
        formData.set("petPhoto", compressedPhoto)
      }

      // Simular envío a API
      const response = await this.submitReport(formData)

      if (response.success) {
        patitaApp.showAlert(successElement, "Reporte publicado exitosamente", "success")
        form.reset()

        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = `mascota.html?id=${response.petId}`
        }, 2000)
      } else {
        patitaApp.showAlert(errorElement, response.message)
      }
    } catch (error) {
      console.error("Error al publicar:", error)
      patitaApp.showAlert(errorElement, "Error al publicar el reporte. Inténtalo de nuevo.")
    } finally {
      // Restaurar botón
      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.textContent = "Publicar reporte"
      submitBtn.disabled = false
    }
  }

  validateForm(formData, errorElement) {
    const reportType = formData.get("reportType")
    const animalType = formData.get("animalType")
    const location = formData.get("location")
    const description = formData.get("description")
    const latitude = formData.get("latitude")
    const longitude = formData.get("longitude")

    if (!reportType) {
      patitaApp.showAlert(errorElement, "Selecciona el tipo de reporte")
      return false
    }

    if (!animalType) {
      patitaApp.showAlert(errorElement, "Selecciona el tipo de animal")
      return false
    }

    if (animalType === "otro" && !formData.get("otherAnimalType")) {
      patitaApp.showAlert(errorElement, "Especifica el tipo de animal")
      return false
    }

    if (!location.trim()) {
      patitaApp.showAlert(errorElement, "Ingresa la ubicación")
      return false
    }

    if (!description.trim()) {
      patitaApp.showAlert(errorElement, "Ingresa una descripción")
      return false
    }

    if (!latitude || !longitude) {
      patitaApp.showAlert(errorElement, "Selecciona la ubicación en el mapa")
      return false
    }

    return true
  }

  // Simular envío de reporte
  async submitReport(formData) {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const user = patitaApp.getCurrentUser()

    // Simular creación de reporte
    const newReport = {
      id: Date.now(),
      user_id: user.id,
      report_type: formData.get("reportType"),
      animal_type: formData.get("animalType") === "otro" ? formData.get("otherAnimalType") : formData.get("animalType"),
      name: formData.get("petName") || null,
      date: formData.get("lostDate"),
      location: formData.get("location"),
      latitude: Number.parseFloat(formData.get("latitude")),
      longitude: Number.parseFloat(formData.get("longitude")),
      description: formData.get("description"),
      contact_phone: formData.get("contactPhone") || null,
      status: "activa",
      created_at: new Date().toISOString(),
    }

    return {
      success: true,
      petId: newReport.id,
      message: "Reporte publicado exitosamente",
    }
  }
}

// Inicializar página de publicación si estamos en ella
if (document.getElementById("publishForm")) {
  const publishPage = new PublishPage()
}