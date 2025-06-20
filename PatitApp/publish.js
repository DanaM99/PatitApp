// publish.js

class PublishPage {
  constructor() {
    this.init();
  }

  init() {
    this.setupForm();
  }

  setupForm() {
    const form = document.getElementById("publishForm");
    if (form) {
      form.addEventListener("submit", (e) => this.handleSubmit(e));
    }

    // Cargar combos dinámicos
    this.loadSelectOptions("get_tipos_reporte.php", "reportType");
    this.loadSelectOptions("get_tipos_animales.php", "animalType");
    this.loadSelectOptions("get_zonas.php", "zona");

    // Mostrar campo "otro" si corresponde
    const animalTypeSelect = document.getElementById("animalType");
    const otherAnimalTypeGroup = document.getElementById("otherAnimalTypeGroup");

    if (animalTypeSelect) {
      animalTypeSelect.addEventListener("change", (e) => {
        if (e.target.value === "otro") {
          otherAnimalTypeGroup.style.display = "block";
          document.getElementById("otherAnimalType").required = true;
        } else {
          otherAnimalTypeGroup.style.display = "none";
          document.getElementById("otherAnimalType").required = false;
        }
      });
    }

    // Preview de imagen
    const photoInput = document.getElementById("petPhoto");
    const photoPreview = document.getElementById("photoPreview");

    if (photoInput && photoPreview) {
      photoInput.addEventListener("change", (e) => {
        this.handlePhotoUpload(e, photoPreview);
      });
    }

    // Fecha máxima (hoy)
    const dateInput = document.getElementById("lostDate");
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.max = today;
      dateInput.value = today;
    }
  }

  async loadSelectOptions(apiUrl, selectId) {
    try {
      const res = await fetch(apiUrl);
      const data = await res.json();

      const select = document.getElementById(selectId);
      if (!select) return;

      select.innerHTML = '<option value="">Seleccionar...</option>';
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.idTipoReporte || item.idTipoAnimal || item.idZona;
        option.textContent = item.nombre;
        select.appendChild(option);
      });

      if (selectId === "animalType") {
        const otroOption = document.createElement("option");
        otroOption.value = "otro";
        otroOption.textContent = "Otro";
        select.appendChild(otroOption);
      }
    } catch (err) {
      console.error(`Error cargando ${selectId}:`, err);
    }
  }

  handlePhotoUpload(event, previewElement) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado grande. Máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewElement.innerHTML = `
        <img src="${e.target.result}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">
      `;
    };
    reader.readAsDataURL(file);
  }

  async handleSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const errorElement = document.getElementById("publishError");
    const successElement = document.getElementById("publishSuccess");

    if (!this.validateForm(formData, errorElement)) return;

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Publicando...";
      submitBtn.disabled = true;

      // Simular envío
      const response = await this.submitReport(formData);

      if (response.success) {
        successElement.style.display = "block";
        successElement.textContent = "✅ Reporte publicado exitosamente.";
        form.reset();

        setTimeout(() => {
          successElement.style.display = "none";
        }, 3000);
      } else {
        errorElement.style.display = "block";
        errorElement.textContent = response.message || "Error al publicar.";
      }
    } catch (err) {
      console.error("Error al publicar:", err);
      errorElement.style.display = "block";
      errorElement.textContent = "Error inesperado al publicar el reporte.";
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = "Publicar reporte";
      submitBtn.disabled = false;
    }
  }

  validateForm(formData, errorElement) {
    const reportType = formData.get("reportType");
    const animalType = formData.get("animalType");
    const description = formData.get("description");

    if (!reportType) {
      errorElement.style.display = "block";
      errorElement.textContent = "Selecciona el tipo de reporte.";
      return false;
    }

    if (!animalType) {
      errorElement.style.display = "block";
      errorElement.textContent = "Selecciona el tipo de animal.";
      return false;
    }

    if (animalType === "otro" && !formData.get("otherAnimalType")) {
      errorElement.style.display = "block";
      errorElement.textContent = "Especifica el tipo de animal.";
      return false;
    }

    if (!description.trim()) {
      errorElement.style.display = "block";
      errorElement.textContent = "Ingresa una descripción.";
      return false;
    }

    return true;
  }

  async submitReport(formData) {
    // Simula un envío exitoso (esto se conecta a tu backend real en producción)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
}

// Iniciar cuando cargue la página
if (document.getElementById("publishForm")) {
  new PublishPage();
}