<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método no permitido. Usa POST.']);
    exit;
}

if (!isset($_POST['id'])) {
    echo json_encode(['success' => false, 'error' => 'Falta el parámetro id']);
    exit;
}

$idReporte = intval($_POST['id']);

// Aquí conectar a la base de datos
$host = 'localhost';
$usuario = 'root';
$contrasena = '';
$base_de_datos = 'patitapp_db';

$conexion = new mysqli($host, $usuario, $contrasena, $base_de_datos);
if ($conexion->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Error de conexión: ' . $conexion->connect_error]);
    exit;
}

// Preparar la consulta para eliminar
$stmt = $conexion->prepare("DELETE FROM reportes WHERE idReporte = ?");
$stmt->bind_param("i", $idReporte);

if ($stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $conexion->error]);
}

$stmt->close();
$conexion->close();
?>
