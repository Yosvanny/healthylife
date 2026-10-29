<?php
// Crea y reutiliza una unica conexion PDO a MySQL/MariaDB.
function obtenerConexion(): PDO
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $config = require __DIR__ . '/config.php';

    $dsn = 'mysql:host=' . $config['db_host']
        . ';dbname=' . $config['db_nombre']
        . ';charset=utf8mb4';

    $pdo = new PDO($dsn, $config['db_usuario'], $config['db_contrasena'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}
