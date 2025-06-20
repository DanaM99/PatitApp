<?php
$host = 'localhost';
$usuario = 'root';
$contrasena = ''; // Cambiar si usás contraseña
$base_de_datos = 'patitapp_db';

$conexion = new mysqli($host, $usuario, $contrasena, $base_de_datos);

if ($conexion->connect_error) {
    die("❌ Error de conexión: " . $conexion->connect_error);
}
?>
