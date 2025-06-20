<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "patitapp_db";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
}

// Línea temporal para testeo:
echo "✅ Conexión establecida desde db.php";
?>