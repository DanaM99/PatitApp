let reportId; // variable global
let originalPhotoSrc = ''; // para cancelar imagen seleccionada


document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    reportId = urlParams.get('id');


    if (reportId) {
        loadPetDetails(reportId);
    } else {
        showPetNotFound();
    }


    setupEditModalHandlers();
});


async function loadPetDetails(reportId) {
    try {
        const response = await fetch(`get_reporte.php?idReporte=${reportId}`);
        const pet = await response.json();


        if (response.ok && pet.id) {
            displayPetDetails(pet);
        } else {
            showPetNotFound();
        }
    } catch (error) {
        console.error('Error al cargar los detalles:', error);
        showPetNotFound();
    }
}


function displayPetDetails(pet) {
    document.getElementById('loadingPet').style.display = 'none';
    const petDetail = document.getElementById('petDetail');
    petDetail.style.display = 'block';


    // Mostrar datos
    document.getElementById('petName').textContent = pet.name || 'Nombre no disponible';
    document.getElementById('contactName').textContent = pet.user_name || 'Usuario desconocido';
    document.getElementById('contactEmail').textContent = pet.user_email || 'Email no disponible';
    document.getElementById('petAnimalType').textContent = pet.animal_type || 'No especificado';
    document.getElementById('petDate').textContent = patitaApp.formatDate(pet.date);
    document.getElementById('petLocation').textContent = pet.location || 'Ubicación no especificada';
    document.getElementById('petZone').textContent = pet.zona_nombre || 'Zona no especificada';
    document.getElementById('petDescription').textContent = pet.description || 'No hay descripción disponible';


    const petImage = document.getElementById('petImage');
    petImage.src = pet.photo || '/placeholder.svg';


    const statusBadge = document.getElementById('petStatus');
    const typeBadge = document.getElementById('petType');


    statusBadge.innerHTML = pet.report_status
        ? `<span class="status-badge ${pet.report_status.toLowerCase() === 'resuelto' ? 'resolved' : 'active'}">${pet.report_status}</span>`
        : '';


    if (pet.report_type?.toLowerCase().includes('perd')) {
        typeBadge.innerHTML = '<span class="type-badge lost">Perdido</span>';
    } else {
        typeBadge.innerHTML = '<span class="type-badge found">Encontrado</span>';
    }


    document.getElementById('contactPhone').textContent = pet.phone || 'No disponible';
    if (!pet.phone) {
        document.getElementById('contactPhoneContainer').style.display = 'none';
    } else {
        document.getElementById('contactPhoneContainer').style.display = 'block';
    }


    const currentUser = patitaApp.getCurrentUser();
    const petActions = document.getElementById('petActions');
    if (currentUser && currentUser.idUsuario === pet.idUsuario) {
        petActions.style.display = 'block';


        const markResolvedBtn = document.getElementById('markResolvedBtn');
        const editPetBtn = document.getElementById('editPetBtn');


        if (pet.report_status?.toLowerCase() === 'resuelto') {
            markResolvedBtn.style.display = 'none';
            editPetBtn.style.display = 'none';
        } else {
            markResolvedBtn.style.display = 'inline-block';
            editPetBtn.style.display = 'inline-block';


            markResolvedBtn.onclick = () => markAsResolved(pet.id);
            editPetBtn.onclick = () => openEditModal(pet);
        }


        document.getElementById('deletePetBtn').onclick = () => showDeleteConfirmation(pet.id);
    } else {
        petActions.style.display = 'none';
    }
}


function showPetNotFound() {
    document.getElementById('loadingPet').style.display = 'none';
    document.getElementById('petNotFound').style.display = 'block';
}


function showDeleteConfirmation(petId) {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'block';


    document.getElementById('confirmationTitle').textContent = 'Eliminar reporte';
    document.getElementById('confirmationMessage').textContent = '¿Estás seguro que deseas eliminar este reporte? Esta acción no se puede deshacer.';


    document.getElementById('cancelConfirmation').onclick = () => {
        modal.style.display = 'none';
    };


    document.getElementById('confirmAction').onclick = () => {
        deletePet(petId);
        modal.style.display = 'none';
    };
}


async function deletePet(petId) {
    try {
        const response = await fetch('delete_report.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${petId}`
        });


        const data = await response.json();


        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Eliminado!',
                text: 'El reporte fue eliminado correctamente',
            }).then(() => {
                window.location.href = 'index.html';
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el reporte: ' + (data.error || 'Error desconocido'),
            });
        }


    } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudo conectar con el servidor.',
        });
    }
}


async function markAsResolved(petId) {
    try {
        const response = await patitaApp.apiRequest(`get_stats.php?id=${petId}`, {
            method: 'POST'
        });


        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Reporte marcado como resuelto',
            }).then(() => {
                window.location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.message || 'No se pudo actualizar el reporte',
            });
        }


    } catch (error) {
        console.error('Error al marcar como resuelto:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al actualizar el reporte.',
        });
    }
}


// --- Edición ---
function setupEditModalHandlers() {
    document.getElementById('closeEditModal').onclick = () => {
        document.getElementById('editModal').style.display = 'none';
    };


    window.onclick = function (event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };


    const cancelBtn = document.getElementById('cancelPhotoBtn');
    cancelBtn.style.display = 'none';


    document.getElementById('editPhoto').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                document.getElementById('currentPhoto').src = event.target.result;
                cancelBtn.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });


    cancelBtn.addEventListener('click', () => {
        document.getElementById('editPhoto').value = '';
        document.getElementById('currentPhoto').src = originalPhotoSrc;
        cancelBtn.style.display = 'none';
    });


    document.getElementById('editForm').addEventListener('submit', async function (e) {
        e.preventDefault();


        const form = e.target;
        const formData = new FormData();


        formData.append('id', reportId);
        formData.append('name', form.editName.value);
        formData.append('description', form.editDescription.value);
        formData.append('phone', form.editPhone.value);
        formData.append('location', form.editLocation.value);
        formData.append('date', form.editDate.value);
        formData.append('idTipoAnimal', form.editAnimalType.value);
        formData.append('idTipoReporte', form.editReportType.value);
        formData.append('idZona', form.editZona.value);


        const photoFile = form.editPhoto.files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }


        try {
            const response = await fetch('update_reporte.php', {
                method: 'POST',
                body: formData
            });


            const data = await response.json();
            if (data.success) {
                alert('✅ Cambios guardados correctamente');
                location.reload();
            } else {
                alert('❌ Error al guardar: ' + (data.message || 'Error desconocido'));
            }
        } catch (err) {
            console.error('Error al actualizar:', err);
            alert('⚠️ Fallo al conectar con el servidor');
        }
    });
}


async function openEditModal(pet) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'flex';


    await cargarOpciones();


    document.getElementById('editName').value = pet.name || '';
    document.getElementById('editDescription').value = pet.description || '';
    document.getElementById('editPhone').value = pet.phone || '';
    document.getElementById('editLocation').value = pet.location || '';
    document.getElementById('editDate').value = pet.date || '';
    document.getElementById('editAnimalType').value = pet.idTipoAnimal || '';
    document.getElementById('editReportType').value = pet.idTipoReporte || '';
    document.getElementById('editZona').value = pet.idZona || '';


    const photo = pet.photo || '/placeholder.svg';
    document.getElementById('currentPhoto').src = photo;
    originalPhotoSrc = photo;
    document.getElementById('editPhoto').value = '';
}


async function cargarOpciones() {
    const [animales, reportes, zonas] = await Promise.all([
        fetch('get_tipos_animales.php').then(res => res.json()),
        fetch('get_tipos_reporte.php').then(res => res.json()),
        fetch('get_zonas.php').then(res => res.json())
    ]);


    const selectAnimal = document.getElementById('editAnimalType');
    const selectReporte = document.getElementById('editReportType');
    const selectZona = document.getElementById('editZona');


    selectAnimal.innerHTML = '<option value="">Seleccionar</option>';
    selectReporte.innerHTML = '<option value="">Seleccionar</option>';
    selectZona.innerHTML = '<option value="">Seleccionar</option>';


    animales.forEach(a => selectAnimal.add(new Option(a.nombre, a.idTipoAnimal)));
    reportes.forEach(r => selectReporte.add(new Option(r.nombre, r.idTipoReporte)));
    zonas.forEach(z => selectZona.add(new Option(z.nombre, z.idZona)));
}
