<?php
header('Content-Type: application/json');
include 'db.php';

$sql = "SELECT idZona, nombre FROM zonas ORDER BY nombre";
$result = $conexion->query($sql);

$data = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'idZona' => $row['idZona'],   // ahora coincide con lo que espera el JS
            'nombre' => $row['nombre'],
            'valor' => strtolower(str_replace(' ', '', $row['nombre']))
        ];
    }
}

echo json_encode($data);
?>