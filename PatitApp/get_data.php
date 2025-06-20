<?php
$host = 'localhost';
$user = 'root';
$password = '';
$db = 'patitapp_db';

$conexion = new mysqli($host, $user, $password, $db);

if ($conexion->connect_error) {
    die(json_encode([]));
}

$table = $_GET['table'] ?? '';

$validTables = ['tipos_reporte', 'tipos_animales', 'zonas'];

if (!in_array($table, $validTables)) {
    echo json_encode([]);
    exit;
}

$query = "SELECT nombre FROM $table";
$result = $conexion->query($query);

$data = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}

echo json_encode($data);
