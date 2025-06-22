<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
    exit;
}

// Validar datos mínimos
if (
    !isset($_POST['idUsuario']) || !isset($_POST['reportType']) || !isset($_POST['animalType']) ||
    !isset($_POST['zona']) || !isset($_POST['lostDate']) || !isset($_POST['description'])
) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Faltan datos obligatorios"]);
    exit;
}

$idUsuario = intval($_POST['idUsuario']);
$idTipoReporte = intval($_POST['reportType']);
$idTipoAnimal = $_POST['animalType'] === 'otro' ? null : intval($_POST['animalType']);
$otroAnimal = $_POST['animalType'] === 'otro' ? $_POST['otherAnimalType'] : null;
$idZona = intval($_POST['zona']);
$nombreMascota = $_POST['petName'] ?? null;
$ubicacion = $_POST['ubicacionDescripcion'] ?? ''; // Ahora es la ubicación real
$fechaReporte = $_POST['lostDate'];
$descripcion = $_POST['description'];
$telefono = $_POST['contactPhone'] ?? null;

// Subida de imagen
if (!isset($_FILES['petPhoto'])) {
    echo json_encode(["success" => false, "message" => "Debes subir una imagen"]);
    exit;
}

$imagen = $_FILES['petPhoto'];
$nombreArchivo = uniqid("foto_") . "." . pathinfo($imagen['name'], PATHINFO_EXTENSION);
$rutaDestino = "uploads/" . $nombreArchivo;

if (!move_uploaded_file($imagen['tmp_name'], $rutaDestino)) {
    echo json_encode(["success" => false, "message" => "Error al guardar la imagen"]);
    exit;
}

// Insertar reporte
$stmt = $conexion->prepare("
    INSERT INTO reportes 
    (idUsuario, idZona, idTipoAnimal, idTipoReporte, nombreMascota, otroAnimal, ubicacion, fechaReporte, descripcion, telefonoContacto)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->bind_param(
    "iiiissssss",
    $idUsuario,
    $idZona,
    $idTipoAnimal,
    $idTipoReporte,
    $nombreMascota,
    $otroAnimal,
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

// Guardar imagen en imagenes_reporte
$stmtImg = $conexion->prepare("INSERT INTO imagenes_reporte (idReporte, urlImagen) VALUES (?, ?)");
$stmtImg->bind_param("is", $idReporte, $rutaDestino);
$stmtImg->execute();
$stmtImg->close();

echo json_encode(["success" => true, "message" => "Reporte guardado con éxito"]);
?>
