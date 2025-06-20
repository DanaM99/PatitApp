<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$consulta = $conexion->prepare("INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)");
$consulta->bind_param("sss", $name, $email, $password);

if ($consulta->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "❌ Error: " . $conexion->error]);
}
?>
