<?php
header('Content-Type: application/json');
include 'db.php';

$idReporte = isset($_GET['idReporte']) ? intval($_GET['idReporte']) : null;

if ($idReporte !== null) {
    // Consulta individual
    $stmt = $conexion->prepare("
        SELECT 
            r.idReporte AS id,
            r.nombreMascota AS name,
            r.ubicacion AS location,
            r.fechaReporte AS date,
            r.descripcion AS description,
            r.telefonoContacto AS phone,
            r.idTipoAnimal,
            r.idTipoReporte,
            ta.nombre AS animal_type,
            tr.nombre AS report_type,
            img.urlImagen AS photo,
            r.fechaCreacion,
            r.idUsuario,
            u.name AS user_name,
            u.email AS user_email,   -- Agregado para traer email
            r.idZona
        FROM reportes r
        LEFT JOIN tipos_animales ta ON r.idTipoAnimal = ta.idTipoAnimal
        LEFT JOIN tipos_reporte tr ON r.idTipoReporte = tr.idTipoReporte
        LEFT JOIN imagenes_reporte img ON r.idReporte = img.idReporte
        LEFT JOIN usuarios u ON r.idUsuario = u.idUsuario
        WHERE r.idReporte = ?
        LIMIT 1
    ");
    $stmt->bind_param("i", $idReporte);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado && $fila = $resultado->fetch_assoc()) {
        echo json_encode($fila);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Reporte no encontrado"]);
    }

    $stmt->close();
} else {
    // Si no hay idReporte, se devuelven todos los reportes (como antes)
    $sql = "
        SELECT 
            r.idReporte AS id,
            r.nombreMascota AS name,
            r.ubicacion AS location,
            r.fechaReporte AS date,
            r.descripcion AS description,
            r.telefonoContacto AS phone,
            r.idTipoAnimal,
            r.idTipoReporte,
            ta.nombre AS animal_type,
            tr.nombre AS report_type,
            img.urlImagen AS photo,
            r.fechaCreacion,
            r.idUsuario,
            u.email AS user_email,
            r.idZona
        FROM reportes r
        LEFT JOIN tipos_animales ta ON r.idTipoAnimal = ta.idTipoAnimal
        LEFT JOIN tipos_reporte tr ON r.idTipoReporte = tr.idTipoReporte
        LEFT JOIN imagenes_reporte img ON r.idReporte = img.idReporte
        LEFT JOIN usuarios u ON r.idUsuario = u.idUsuario
        ORDER BY r.fechaCreacion DESC
    ";

    $resultado = $conexion->query($sql);
    $reportes = [];

    if ($resultado) {
        while ($fila = $resultado->fetch_assoc()) {
            $reportes[] = $fila;
        }
        echo json_encode($reportes);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error al obtener los reportes"]);
    }
}
?>
