<?php
// Funciones de autenticacion compartidas por registro.php, login.php, perfil.php y logout.php.
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

// Valida el nombre del usuario (registro y perfil) y lo devuelve sin espacios sobrantes.
function validarNombre(mixed $valor): string
{
    $nombre = trim((string) $valor);
    if ($nombre === '' || mb_strlen($nombre) > 100) {
        responderError('El nombre es obligatorio y debe tener máximo 100 caracteres');
    }
    return $nombre;
}

// Lee el encabezado "Authorization: Bearer <token>" y devuelve el hash del token.
// Responde 401 si no viene o tiene un formato incorrecto.
function obtenerTokenHash(): string
{
    $encabezado = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    // Algunas configuraciones de Apache no pasan el encabezado a $_SERVER.
    if ($encabezado === '' && function_exists('getallheaders')) {
        $encabezados = array_change_key_case(getallheaders(), CASE_LOWER);
        $encabezado = $encabezados['authorization'] ?? '';
    }

    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($encabezado), $partes)) {
        responderError('Debes iniciar sesión', 401);
    }

    return hash('sha256', strtolower($partes[1]));
}

// Devuelve la fila del usuario dueno del token; responde 401 si la sesion no existe o ya expiro.
function exigirUsuario(): array
{
    $consulta = obtenerConexion()->prepare(
        'SELECT u.* FROM sesiones s
         JOIN usuarios u ON u.id = s.usuario_id
         WHERE s.token_hash = ? AND s.fecha_expiracion > NOW()'
    );
    $consulta->execute([obtenerTokenHash()]);
    $usuario = $consulta->fetch();

    if (!$usuario) {
        responderError('Tu sesión no es válida o expiró; inicia sesión de nuevo', 401);
    }

    return $usuario;
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
