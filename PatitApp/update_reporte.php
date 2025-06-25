<?php
header('Content-Type: application/json');
include 'db.php';

$id = isset($_POST['id']) ? intval($_POST['id']) : null;

if (!$id) {
    echo json_encode(["success" => false, "message" => "ID inválido"]);
    exit;
}

// Escapar y obtener campos
$nombre = $_POST['name'] ?? '';
$descripcion = $_POST['description'] ?? '';
$telefono = $_POST['phone'] ?? '';
$ubicacion = $_POST['location'] ?? '';
$fecha = $_POST['date'] ?? '';
$idTipoAnimal = $_POST['idTipoAnimal'] ?? null;
$idTipoReporte = $_POST['idTipoReporte'] ?? null;
$idZona = $_POST['idZona'] ?? null;

// Actualizar datos
$stmt = $conexion->prepare("
    UPDATE reportes 
    SET nombreMascota = ?, descripcion = ?, telefonoContacto = ?, ubicacion = ?, fechaReporte = ?, 
        idTipoAnimal = ?, idTipoReporte = ?, idZona = ?
    WHERE idReporte = ?
");

$stmt->bind_param("ssssssiii", $nombre, $descripcion, $telefono, $ubicacion, $fecha, $idTipoAnimal, $idTipoReporte, $idZona, $id);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error al actualizar datos"]);
    exit;
}
$stmt->close();

// Procesar imagen si se subió una nueva
if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
    $fileTmp = $_FILES['photo']['tmp_name'];
    $fileName = basename($_FILES['photo']['name']);
    $uploadDir = 'uploads/';
    $filePath = $uploadDir . uniqid() . '_' . $fileName;

    // Crear carpeta si no existe
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    if (move_uploaded_file($fileTmp, $filePath)) {
        // Guardar ruta en la tabla imagenes_reporte
        // Eliminar imagen anterior si es necesario (opcional)
        $conexion->query("DELETE FROM imagenes_reporte WHERE idReporte = $id");

        $stmtImg = $conexion->prepare("INSERT INTO imagenes_reporte (idReporte, urlImagen) VALUES (?, ?)");
        $stmtImg->bind_param("is", $id, $filePath);
        $stmtImg->execute();
        $stmtImg->close();
    } else {
        echo json_encode(["success" => false, "message" => "Error al subir imagen"]);
        exit;
    }
}

echo json_encode(["success" => true]);
?>
