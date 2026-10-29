<?php
// POST: cierra la sesion borrando la fila del token en sesiones.
// Requiere el encabezado "Authorization: Bearer <token>".
require __DIR__ . '/utilidades.php';
require __DIR__ . '/conexion.php';
require __DIR__ . '/auth.php';

exigirMetodo('POST');

$consulta = obtenerConexion()->prepare('DELETE FROM sesiones WHERE token_hash = ?');
$consulta->execute([obtenerTokenHash()]);

if ($consulta->rowCount() === 0) {
    responderError('La sesión no existe o ya estaba cerrada', 401);
}

responderExito(['mensaje' => 'Sesión cerrada']);
