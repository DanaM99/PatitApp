<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

// Validar campos obligatorios
$requiredFields = ['idUsuario', 'reportType', 'animalType', 'zona', 'lostDate', 'description'];
foreach ($requiredFields as $field) {
    if (!isset($_POST[$field]) || empty($_POST[$field])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Faltan datos obligatorios: $field"]);
        exit;
    }
}

$idUsuario = intval($_POST['idUsuario']);
$idTipoReporte = intval($_POST['reportType']);
$idTipoAnimal = ($_POST['animalType'] === 'otro') ? null : intval($_POST['animalType']);
$otroAnimal = ($_POST['animalType'] === 'otro') ? $_POST['otherAnimalType'] : null;
$idZona = intval($_POST['zona']);
$nombreMascota = $_POST['petName'] ?? null;
$ubicacion = $_POST['ubicacionDescripcion'] ?? '';
$fechaReporte = $_POST['lostDate'];
$descripcion = $_POST['description'];
$telefono = $_POST['contactPhone'] ?? null;

if (!isset($_FILES['petPhoto'])) {
    echo json_encode(["success" => false, "message" => "Debes subir una imagen"]);
    exit;
}

$imagen = $_FILES['petPhoto'];

// Validar que el archivo es imagen y tamaño permitido (opcional, mejora seguridad)
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!in_array($imagen['type'], $allowedTypes)) {
    echo json_encode(["success" => false, "message" => "Formato de imagen no permitido. Usa JPG, PNG o GIF."]);
    exit;
}

$maxSize = 5 * 1024 * 1024; // 5MB
if ($imagen['size'] > $maxSize) {
    echo json_encode(["success" => false, "message" => "La imagen es demasiado grande. Máximo 5MB."]);
    exit;
}

$ext = pathinfo($imagen['name'], PATHINFO_EXTENSION);
$nombreArchivo = uniqid("foto_") . "." . $ext;
$rutaDestino = "uploads/" . $nombreArchivo;

if (!move_uploaded_file($imagen['tmp_name'], $rutaDestino)) {
    echo json_encode(["success" => false, "message" => "Error al guardar la imagen"]);
    exit;
}

$idEstadoReporte = 1; // activo

// Insertar reporte con estado activo
$stmt = $conexion->prepare("
    INSERT INTO reportes 
    (idUsuario, idZona, idTipoAnimal, idTipoReporte, idEstadoReporte, nombreMascota, ubicacion, fechaReporte, descripcion, telefonoContacto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "iiiiisssss",
    $idUsuario,
    $idZona,
    $idTipoAnimal,
    $idTipoReporte,
    $idEstadoReporte,
    $nombreMascota,
    $ubicacion,
    $fechaReporte,
    $descripcion,
    $telefono
);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Error al guardar el reporte"]);
    exit;
}

$idReporte = $stmt->insert_id;
$stmt->close();

// Insertar ruta de imagen en tabla imagenes_reporte
$stmtImg = $conexion->prepare("INSERT INTO imagenes_reporte (idReporte, urlImagen) VALUES (?, ?)");
$stmtImg->bind_param("is", $idReporte, $rutaDestino);
$stmtImg->execute();
$stmtImg->close();

echo json_encode(["success" => true, "message" => "Reporte guardado con éxito", "idReporte" => $idReporte]);
?>