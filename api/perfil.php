<?php
// GET: devuelve el perfil del usuario con sesion iniciada.
// PUT: actualiza nombre y/o meta de agua. Cuerpo: {"nombre": "...", "metaAguaMl": 2500}
require __DIR__ . '/utilidades.php';
require __DIR__ . '/conexion.php';
require __DIR__ . '/auth.php';

// Limites razonables para una meta diaria de agua (no es una recomendacion medica).
const META_AGUA_MIN_ML = 250;
const META_AGUA_MAX_ML = 10000;

$usuario = exigirUsuario();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    responderExito(['usuario' => formatearUsuario($usuario)]);
}

if ($metodo !== 'PUT') {
    responderError('Método no permitido', 405);
}

$cuerpo = leerCuerpoJson();
if (!array_key_exists('nombre', $cuerpo) && !array_key_exists('metaAguaMl', $cuerpo)) {
    responderError('Envía al menos un dato para actualizar: nombre o metaAguaMl');
}

// Si un campo no viene, se conserva el valor actual.
$nombre = array_key_exists('nombre', $cuerpo)
    ? validarNombre($cuerpo['nombre'])
    : $usuario['nombre'];

$metaAguaMl = (int) $usuario['meta_agua_ml'];
if (array_key_exists('metaAguaMl', $cuerpo)) {
    $metaAguaMl = filter_var($cuerpo['metaAguaMl'], FILTER_VALIDATE_INT, [
        'options' => ['min_range' => META_AGUA_MIN_ML, 'max_range' => META_AGUA_MAX_ML],
    ]);
    if ($metaAguaMl === false) {
        responderError('La meta de agua debe ser un número entero entre '
            . META_AGUA_MIN_ML . ' y ' . META_AGUA_MAX_ML . ' ml');
    }
}

$pdo = obtenerConexion();
$consulta = $pdo->prepare('UPDATE usuarios SET nombre = ?, meta_agua_ml = ? WHERE id = ?');
$consulta->execute([$nombre, $metaAguaMl, $usuario['id']]);

$consulta = $pdo->prepare('SELECT * FROM usuarios WHERE id = ?');
$consulta->execute([$usuario['id']]);

responderExito(['usuario' => formatearUsuario($consulta->fetch())]);
