<?php
header('Content-Type: application/json');

$conexion = new mysqli('localhost', 'root', '', 'patitapp_db');
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a BD']);
    exit;
}

function fetchAll($conn, $table, $idField) {
    $resultado = $conn->query("SELECT $idField AS id, nombre FROM $table");
    $data = [];
    while ($fila = $resultado->fetch_assoc()) {
        $data[] = $fila;
    }
    return $data;
}

$response = [
    'tiposReporte' => fetchAll($conexion, 'tipos_reporte', 'idTipoReporte'),
    'tiposAnimal' => fetchAll($conexion, 'tipos_animales', 'idTipoAnimal'),
    'zonas' => fetchAll($conexion, 'zonas', 'idZona')
];

echo json_encode($response);
?>
