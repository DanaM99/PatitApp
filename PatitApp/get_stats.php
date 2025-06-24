<?php
header('Content-Type: application/json');
include 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $idReporte = isset($_GET['id']) ? intval($_GET['id']) : 0;

    if ($idReporte <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "ID de reporte inválido"]);
        exit;
    }

    // Verificar que el reporte existe
    $stmtCheck = $conexion->prepare("SELECT idReporte FROM reportes WHERE idReporte = ?");
    $stmtCheck->bind_param("i", $idReporte);
    $stmtCheck->execute();
    $stmtCheck->store_result();

    if ($stmtCheck->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Reporte no encontrado"]);
        $stmtCheck->close();
        exit;
    }
    $stmtCheck->close();

    // Actualizar estado a 'Resuelto' (2)
    $nuevoEstado = 2;
    $stmt = $conexion->prepare("UPDATE reportes SET idEstadoReporte = ? WHERE idReporte = ?");
    $stmt->bind_param("ii", $nuevoEstado, $idReporte);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Reporte actualizado a resuelto"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al actualizar el estado del reporte"]);
    }

    $stmt->close();
} else {
    http_response_code(405); // Método no permitido
    echo json_encode(["success" => false, "message" => "Método no permitido"]);
}
?>
