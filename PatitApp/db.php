<?php
$host = 'localhost';
$usuario = 'root';
$contrasena = '';
$base_de_datos = 'patitapp_db';

$conn = new mysqli($host, $usuario, $contrasena, $base_de_datos);

if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
}
?>
