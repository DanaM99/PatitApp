<?php
header('Content-Type: application/json');
include 'db.php';

$sql = "SELECT idTipoAnimal, nombre FROM tipos_animales ORDER BY nombre";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
