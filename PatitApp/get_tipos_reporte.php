<?php
header('Content-Type: application/json');
include 'db.php';

$sql = "SELECT idTipoReporte, nombre FROM tipos_reporte ORDER BY nombre";
$result = $conexion->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
