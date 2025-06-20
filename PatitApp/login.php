<?php
header('Content-Type: application/json');
include 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'];
$password = $data['password'];

$consulta = $conexion->prepare("SELECT * FROM usuarios WHERE email = ?");
$consulta->bind_param("s", $email);
$consulta->execute();
$resultado = $consulta->get_result();

if ($resultado->num_rows === 1) {
    $usuario = $resultado->fetch_assoc();
    
    if (password_verify($password, $usuario['password'])) {
        // Autenticación exitosa
        echo json_encode([
            "success" => true,
            "user" => [
    "idUsuario" => $usuario['idUsuario'], // CAMBIO AQUÍ
    "name" => $usuario['name'],
    "email" => $usuario['email']
]

        ]);
    } else {
        echo json_encode(["success" => false, "message" => "❌ Contraseña incorrecta."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "❌ Usuario no encontrado."]);
}
?>
