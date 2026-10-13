<?php
// Punto de prueba: confirma que Apache ejecuta la API de HealthyLife.
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'estado' => 'ok',
    'mensaje' => 'API de HealthyLife funcionando',
    'php' => PHP_VERSION,
]);
