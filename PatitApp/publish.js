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

    this.loadSelectOptions("get_tipos_reporte.php", "reportType");
    this.loadSelectOptions("get_tipos_animales.php", "animalType");
    this.loadSelectOptions("get_zonas.php", "zona");

    const photoInput = document.getElementById("petPhoto");
    const photoPreview = document.getElementById("photoPreview");

    if (photoInput && photoPreview) {
      photoInput.addEventListener("change", (e) => {
        this.handlePhotoUpload(e, photoPreview);
      });
    }

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
    } catch (err) {
      console.error(`Error cargando ${selectId}:`, err);
    }
  }

  handlePhotoUpload(event, previewElement) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire("Archivo inválido", "Por favor selecciona un archivo válido.", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Imagen muy grande", "La imagen es demasiado grande. Máximo 5MB.", "warning");
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

    const user = JSON.parse(localStorage.getItem("patita_user"));
    if (!user || !user.idUsuario) {
      Swal.fire("Sesión inválida", "No se encontró el usuario en sesión.", "error");
      return;
    }

    formData.append("idUsuario", user.idUsuario);
    formData.append("ubicacionDescripcion", formData.get("ubicacionDescripcion") || "");

    if (!this.validateForm(formData)) return;

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Publicando...";
      submitBtn.disabled = true;

      const response = await this.submitReport(formData);

      if (response.success) {
        Swal.fire("¡Éxito!", "Reporte publicado exitosamente.", "success");

        form.reset();
        document.getElementById("photoPreview").innerHTML = `
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Haz clic para subir una foto</p>
        `;
      } else {
        Swal.fire("Error", response.message || "Error al publicar.", "error");
      }
    } catch (err) {
      console.error("Error al publicar:", err);
      Swal.fire("Error inesperado", "Ocurrió un error al publicar el reporte.", "error");
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = "Publicar reporte";
      submitBtn.disabled = false;
    }
  }

  validateForm(formData) {
    if (!formData.get("reportType")) {
      Swal.fire("Falta información", "Selecciona el tipo de reporte.", "warning");
      return false;
    }

    if (!formData.get("animalType")) {
      Swal.fire("Falta información", "Selecciona el tipo de animal.", "warning");
      return false;
    }

    if (!formData.get("description")?.trim()) {
      Swal.fire("Falta información", "Ingresa una descripción.", "warning");
      return false;
    }

    return true;
  }

  async submitReport(formData) {
    const response = await fetch("publicar_reporte.php", {
      method: "POST",
      body: formData
    });

    return await response.json();
  }
}

if (document.getElementById("publishForm")) {
  new PublishPage();
}
