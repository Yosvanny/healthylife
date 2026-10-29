<?php
// POST: inicia sesion con correo y contrasena; devuelve un token nuevo.
// Cuerpo: {"email": "...", "password": "..."}
require __DIR__ . '/utilidades.php';
require __DIR__ . '/conexion.php';
require __DIR__ . '/auth.php';

exigirMetodo('POST');

$cuerpo = leerCuerpoJson();
$email = strtolower(trim((string) ($cuerpo['email'] ?? '')));
$password = (string) ($cuerpo['password'] ?? '');

if ($email === '' || $password === '') {
    responderError('Escribe tu correo y tu contraseña');
}

$consulta = obtenerConexion()->prepare('SELECT * FROM usuarios WHERE email = ?');
$consulta->execute([$email]);
$usuario = $consulta->fetch();

// El mismo mensaje para correo inexistente o contrasena incorrecta:
// asi nadie puede averiguar que correos estan registrados.
if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
    responderError('Correo o contraseña incorrectos', 401);
}

responderExito([
    'token' => crearSesion((int) $usuario['id']),
    'usuario' => formatearUsuario($usuario),
]);
