document.addEventListener('DOMContentLoaded', function() {
    // Obtener el ID del reporte de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');
    
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

            markResolvedBtn.onclick = function() {
                markAsResolved(pet.id);
            };

            editPetBtn.onclick = function() {
                window.location.href = `publicar.html?edit=${pet.id}`;
            };
        }

        // El botón eliminar siempre visible para el dueño
        document.getElementById('deletePetBtn').onclick = function() {
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
    
    document.getElementById('cancelConfirmation').onclick = function() {
        modal.style.display = 'none';
    };
    
    document.getElementById('confirmAction').onclick = function() {
        deletePet(petId);
        modal.style.display = 'none';
    };
}

async function deletePet(petId) {
    try {
        const response = await patitaApp.apiRequest(`delete_report.php?id=${petId}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            alert('Reporte eliminado correctamente');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el reporte');
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
