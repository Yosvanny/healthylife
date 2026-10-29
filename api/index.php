<?php
// Punto de prueba: confirma que Apache ejecuta PHP y que hay conexion con la base.
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/conexion.php';

try {
    $tablas = obtenerConexion()->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);
    $bd = ['estado' => 'ok', 'tablas' => count($tablas)];
} catch (PDOException $e) {
    http_response_code(500);
    $bd = ['estado' => 'error', 'mensaje' => 'No se pudo conectar a la base de datos'];
}

echo json_encode([
    'estado' => 'ok',
    'mensaje' => 'API de HealthyLife funcionando',
    'php' => PHP_VERSION,
    'bd' => $bd,
]);
