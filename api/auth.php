<?php
// Funciones de autenticacion compartidas por registro.php, login.php y (paso 6) perfil/cerrar sesion.
// Requiere que antes se haya cargado conexion.php.

const DIAS_SESION = 30;

// Convierte una fila de la tabla usuarios (snake_case) al formato de la app (camelCase).
// Nunca incluye password_hash.
function formatearUsuario(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'nombre' => $fila['nombre'],
        'email' => $fila['email'],
        'metaAguaMl' => (int) $fila['meta_agua_ml'],
        'fechaRegistro' => $fila['fecha_registro'],
    ];
}

// Genera un token aleatorio, guarda solo su hash en sesiones y devuelve el token original.
function crearSesion(int $usuarioId): string
{
    $token = bin2hex(random_bytes(32));

    $consulta = obtenerConexion()->prepare(
        'INSERT INTO sesiones (usuario_id, token_hash, fecha_expiracion)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ' . DIAS_SESION . ' DAY))'
    );
    $consulta->execute([$usuarioId, hash('sha256', $token)]);

    return $token;
}
