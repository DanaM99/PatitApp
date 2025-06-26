<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

// Verificar si el email ya está registrado
$verificar = $conexion->prepare("SELECT idUsuario FROM usuarios WHERE email = ?");
$verificar->bind_param("s", $email);
$verificar->execute();
$verificar->store_result();

if ($verificar->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "El correo ya está registrado. ¿Querés iniciar sesión?"]);
    exit;
}

// Insertar nuevo usuario
$consulta = $conexion->prepare("INSERT INTO usuarios (name, email, password) VALUES (?, ?, ?)");
$consulta->bind_param("sss", $name, $email, $password);

if ($consulta->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "message" => "❌ Error: " . $conexion->error]);
}
?>
