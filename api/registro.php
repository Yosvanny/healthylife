<?php
// POST: crea una cuenta nueva y deja la sesion iniciada.
// Cuerpo: {"nombre": "...", "email": "...", "password": "..."}
require __DIR__ . '/utilidades.php';
require __DIR__ . '/conexion.php';
require __DIR__ . '/auth.php';

exigirMetodo('POST');

$cuerpo = leerCuerpoJson();
$nombre = trim((string) ($cuerpo['nombre'] ?? ''));
$email = strtolower(trim((string) ($cuerpo['email'] ?? '')));
$password = (string) ($cuerpo['password'] ?? '');

// Validaciones (los limites coinciden con las columnas de la tabla usuarios).
if ($nombre === '' || mb_strlen($nombre) > 100) {
    responderError('El nombre es obligatorio y debe tener máximo 100 caracteres');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 150) {
    responderError('El correo electrónico no es válido');
}
// password_hash (bcrypt) solo usa los primeros 72 bytes, por eso el limite superior.
if (mb_strlen($password) < 8 || strlen($password) > 72) {
    responderError('La contraseña debe tener entre 8 y 72 caracteres');
}

$pdo = obtenerConexion();

$consulta = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$consulta->execute([$email]);
if ($consulta->fetch()) {
    responderError('Ya existe una cuenta con ese correo', 409);
}

$consulta = $pdo->prepare('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)');
$consulta->execute([$nombre, $email, password_hash($password, PASSWORD_DEFAULT)]);
$usuarioId = (int) $pdo->lastInsertId();

$consulta = $pdo->prepare('SELECT * FROM usuarios WHERE id = ?');
$consulta->execute([$usuarioId]);

responderExito([
    'token' => crearSesion($usuarioId),
    'usuario' => formatearUsuario($consulta->fetch()),
], 201);
