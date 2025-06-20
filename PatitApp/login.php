<?php
session_start();
include "conexion.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"] ?? '';
    $password = $_POST["password"] ?? '';

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Faltan datos."]);
        exit;
    }

    // Buscar usuario
    $stmt = $conn->prepare("SELECT idUsuario, name, password FROM usuarios WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->bind_result($idUsuario, $name, $hashedPassword);
        $stmt->fetch();

        if (password_verify($password, $hashedPassword)) {
            $_SESSION["idUsuario"] = $idUsuario;
            $_SESSION["name"] = $name;
            echo json_encode(["success" => true, "message" => "Login correcto"]);
        } else {
            echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    }

    $stmt->close();
}
?>