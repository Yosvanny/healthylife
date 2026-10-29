<?php
// Punto de prueba: confirma que Apache ejecuta PHP y que hay conexion con la base.
require __DIR__ . '/utilidades.php';
require __DIR__ . '/conexion.php';

exigirMetodo('GET');

$tablas = obtenerConexion()->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN);

responderExito([
    'mensaje' => 'API de HealthyLife funcionando',
    'php' => PHP_VERSION,
    'tablas' => count($tablas),
]);
