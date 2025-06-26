<?php
header('Content-Type: application/json');
include 'db.php';

$sql = "
    SELECT 
        r.idReporte AS id,
        r.nombreMascota AS name,
        r.ubicacion AS location,
        r.fechaReporte AS date,
        r.descripcion AS description,
        r.telefonoContacto AS phone,
        r.idTipoAnimal,
        ta.nombre AS animal_type,
        r.idTipoReporte,
        tr.nombre AS report_type,
        r.idEstadoReporte,                          -- AÑADIDO
        er.nombre AS report_status,                -- Nombre del estado
        img.urlImagen AS photo,
        r.fechaCreacion,
        r.idUsuario,
        u.email AS user_email,
        r.idZona,
        z.nombre AS zona_nombre
    FROM reportes r
    LEFT JOIN tipos_animales ta ON r.idTipoAnimal = ta.idTipoAnimal
    LEFT JOIN tipos_reporte tr ON r.idTipoReporte = tr.idTipoReporte
    LEFT JOIN imagenes_reporte img ON r.idReporte = img.idReporte
    LEFT JOIN usuarios u ON r.idUsuario = u.idUsuario
    LEFT JOIN estado_reporte er ON r.idEstadoReporte = er.idEstadoReporte
    LEFT JOIN zonas z ON r.idZona = z.idZona
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
?>