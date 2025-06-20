<?php
include 'db.php';
header('Content-Type: application/json');

$idUsuario = $_POST['idUsuario'];
$idTipoReporte = $_POST['reportType'];
$idTipoAnimal = $_POST['animalType'];
$idZona = $_POST['zona'];
$otroAnimal = $_POST['otherAnimalType'] ?? null;
$nombreMascota = $_POST['petName'] ?? null;
$fechaReporte = $_POST['lostDate'];
$descripcion = $_POST['description'];
$telefonoContacto = $_POST['contactPhone'] ?? null;

// Cargar imagen
$fotoNombre = $_FILES['petPhoto']['name'];
$fotoTmp = $_FILES['petPhoto']['tmp_name'];
$rutaDestino = "uploads/" . uniqid() . "_" . basename($fotoNombre);
move_uploaded_file($fotoTmp, $rutaDestino);

// Insertar en reportes
$sql = $conexion->prepare("INSERT INTO reportes 
(idUsuario, idZona, idTipoAnimal, idTipoReporte, nombreMascota, otroAnimal, ubicacion, fechaReporte, descripcion, telefonoContacto, idEstadoReporte)
VALUES (?, ?, ?, ?, ?, ?, 'No definida', ?, ?, ?, 1)");

$sql->bind_param("iiiisssss", 
    $idUsuario, $idZona, $idTipoAnimal, $idTipoReporte,
    $nombreMascota, $otroAnimal, $fechaReporte,
    $descripcion, $telefonoContacto);

if ($sql->execute()) {
    $idReporte = $conexion->insert_id;

    // Insertar imagen relacionada
    $stmtImg = $conexion->prepare("INSERT INTO imagenes_reporte (idReporte, urlImagen) VALUES (?, ?)");
    $stmtImg->bind_param("is", $idReporte, $rutaDestino);
    $stmtImg->execute();

    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => $sql->error]);
}
?>