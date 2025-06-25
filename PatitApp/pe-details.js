let reportId; // variable global
let originalPhotoSrc = ''; // para cancelar imagen seleccionada


document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    reportId = urlParams.get('id'); // ✅ usamos la global

    if (reportId) {
        loadPetDetails(reportId);
    } else {
        showPetNotFound();
    }
});

async function loadPetDetails(reportId) {
    try {
        const response = await fetch(`get_reporte.php?idReporte=${reportId}`);
        const petData = await response.json();

        if (response.ok && petData.id) {
            displayPetDetails(petData);
        } else {
            showPetNotFound();
        }
    } catch (error) {
        console.error('Error al cargar los detalles:', error);
        showPetNotFound();
    }
}

function displayPetDetails(pet) {
    // Ocultar loading y mostrar detalles
    document.getElementById('loadingPet').style.display = 'none';
    const petDetail = document.getElementById('petDetail');
    petDetail.style.display = 'block';

    // Llenar los datos
    document.getElementById('petName').textContent = pet.name || 'Nombre no disponible';
    document.getElementById('contactName').textContent = pet.user_name || 'Usuario desconocido';
    document.getElementById('contactEmail').textContent = pet.user_email || 'Email no disponible';
    document.getElementById('petAnimalType').textContent = pet.animal_type || 'No especificado';
    document.getElementById('petDate').textContent = patitaApp.formatDate(pet.date);
    document.getElementById('petLocation').textContent = pet.location || 'Ubicación no especificada';
    document.getElementById('petZone').textContent = pet.zona_nombre || 'Zona no especificada';
    document.getElementById('petDescription').textContent = pet.description || 'No hay descripción disponible';

    // Establecer la imagen
    const petImage = document.getElementById('petImage');
    if (pet.photo) {
        petImage.src = pet.photo;
    }

    // Configurar el estado y tipo
    const statusBadge = document.getElementById('petStatus');
    const typeBadge = document.getElementById('petType');

    statusBadge.innerHTML = `<span class="status-badge">${pet.report_status}</span>`;

    if (pet.report_type?.toLowerCase().includes('perd')) {
        typeBadge.innerHTML = '<span class="type-badge lost">Perdido</span>';
    } else {
        typeBadge.innerHTML = '<span class="type-badge found">Encontrado</span>';
    }

    // Configurar información de contacto
    document.getElementById('contactPhone').textContent = pet.phone || 'No disponible';
    if (!pet.phone) {
        document.getElementById('contactPhoneContainer').style.display = 'none';
    }

    // Verificar si el usuario actual es el dueño del reporte
    const currentUser = patitaApp.getCurrentUser();
    const petActions = document.getElementById('petActions');

    if (currentUser && currentUser.idUsuario === pet.idUsuario) {
        petActions.style.display = 'block';

        const markResolvedBtn = document.getElementById('markResolvedBtn');
        const editPetBtn = document.getElementById('editPetBtn');

        if (pet.report_status.toLowerCase() === 'resuelto') {
            markResolvedBtn.style.display = 'none';
            editPetBtn.style.display = 'none';  // Ocultar botón editar si está resuelto
        } else {
            markResolvedBtn.style.display = 'inline-block';
            editPetBtn.style.display = 'inline-block'; // Mostrar botón editar si NO está resuelto

            markResolvedBtn.onclick = function () {
                markAsResolved(pet.id);
            };



            editPetBtn.onclick = function () {
                const modal = document.getElementById('editModal');
                modal.style.display = 'flex';

                cargarOpciones().then(() => {
                    document.getElementById('editName').value = pet.name || '';
                    document.getElementById('editDescription').value = pet.description || '';
                    document.getElementById('editPhone').value = pet.phone || '';
                    document.getElementById('editLocation').value = pet.location || '';
                    document.getElementById('editDate').value = pet.date || '';

                    document.getElementById('editAnimalType').value = pet.idTipoAnimal || '';
                    document.getElementById('editReportType').value = pet.idTipoReporte || '';
                    document.getElementById('editZona').value = pet.idZona || '';

                    // Mostrar imagen original
                    const photo = pet.photo || 'img/placeholder.jpg';
                    document.getElementById('currentPhoto').src = photo;

                    // 💾 Guardar la original por si se arrepiente
                    originalPhotoSrc = photo;

                    // ⚠️ Limpiar input file por si venía con otro valor
                    document.getElementById('editPhoto').value = '';
                });

            };
            async function cargarOpciones() {
                const [animales, reportes, zonas] = await Promise.all([
                    fetch('get_tipos_animales.php').then(res => res.json()),
                    fetch('get_tipos_reporte.php').then(res => res.json()),
                    fetch('get_zonas.php').then(res => res.json())
                ]);

                const selectAnimal = document.getElementById('editAnimalType');
                const selectReporte = document.getElementById('editReportType');
                const selectZona = document.getElementById('editZona');

                // Limpiar opciones previas
                selectAnimal.innerHTML = '<option value="">Seleccionar</option>';
                selectReporte.innerHTML = '<option value="">Seleccionar</option>';
                selectZona.innerHTML = '<option value="">Seleccionar</option>';

                animales.forEach(a => {
                    const option = new Option(a.nombre, a.idTipoAnimal);
                    selectAnimal.add(option);
                });

                reportes.forEach(r => {
                    const option = new Option(r.nombre, r.idTipoReporte);
                    selectReporte.add(option);
                });

                zonas.forEach(z => {
                    const option = new Option(z.nombre, z.idZona);
                    selectZona.add(option);
                });
            }
            document.getElementById('closeEditModal').onclick = function () {
                document.getElementById('editModal').style.display = 'none';
            };

            window.onclick = function (event) {
                const modal = document.getElementById('editModal');
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };

            // El botón eliminar siempre visible para el dueño
            document.getElementById('deletePetBtn').onclick = function () {
                showDeleteConfirmation(pet.id);
            };
        }
    }


    function showDeleteConfirmation(petId) {
        // Implementar lógica para mostrar el modal de confirmación
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'block';

        document.getElementById('confirmationTitle').textContent = 'Eliminar reporte';
        document.getElementById('confirmationMessage').textContent = '¿Estás seguro que deseas eliminar este reporte? Esta acción no se puede deshacer.';

        document.getElementById('cancelConfirmation').onclick = function () {
            modal.style.display = 'none';
        };

        document.getElementById('confirmAction').onclick = function () {
            deletePet(petId);
            modal.style.display = 'none';
        };
    }

    async function deletePet(petId) {
        console.log('Intentando eliminar reporte con id:', petId);
        try {
            const response = await fetch('delete_report.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id=${petId}`
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);

            if (data.success) {
                alert('✅ Reporte eliminado correctamente');
                window.location.href = 'index.html';
            } else {
                alert('❌ No se pudo eliminar el reporte: ' + (data.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('⚠️ Error de conexión con el servidor');
        }
    }


    async function markAsResolved(petId) {
        try {
            const response = await patitaApp.apiRequest(`get_stats.php?id=${petId}`, {
                method: 'POST'
            });

            if (response.success) {
                alert('Reporte marcado como resuelto');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error al marcar como resuelto:', error);
            alert('Error al actualizar el reporte');
        }
    }


    function showPetNotFound() {
        document.getElementById('loadingPet').style.display = 'none';
        document.getElementById('petNotFound').style.display = 'block';
    }



    document.getElementById('editForm').addEventListener('submit', async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        formData.append('id', reportId); // este es el ID que ya obtuviste con `get_reporte.php`
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

    const cancelBtn = document.getElementById('cancelPhotoBtn');
    cancelBtn.style.display = 'none'; // oculto al inicio

    document.getElementById('editPhoto').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                document.getElementById('currentPhoto').src = event.target.result;
                cancelBtn.style.display = 'inline-block'; // mostrar cuando se selecciona nueva
            };
            reader.readAsDataURL(file);
        }
    });

    cancelBtn.addEventListener('click', function () {
        document.getElementById('editPhoto').value = '';
        document.getElementById('currentPhoto').src = originalPhotoSrc;
        cancelBtn.style.display = 'none'; // ocultar de nuevo
    });


}