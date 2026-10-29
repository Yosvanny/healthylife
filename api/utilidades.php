<?php
// Funciones comunes: todas las respuestas de la API usan el mismo formato JSON.

function responderJson(int $codigo, array $datos): void
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

function responderExito(array $datos = [], int $codigo = 200): void
{
    responderJson($codigo, ['ok' => true, 'datos' => $datos]);
}

function responderError(string $mensaje, int $codigo = 400): void
{
    responderJson($codigo, ['ok' => false, 'error' => $mensaje]);
}

// Lee el cuerpo de la peticion (POST/PUT) y lo convierte en arreglo.
function leerCuerpoJson(): array
{
    $texto = file_get_contents('php://input');
    if ($texto === false || trim($texto) === '') {
        return [];
    }

    $datos = json_decode($texto, true);
    if (!is_array($datos)) {
        responderError('El cuerpo de la petición no es JSON válido');
    }

    return $datos;
}

// Detiene la peticion si no usa el metodo HTTP esperado (GET, POST, etc.).
function exigirMetodo(string $metodo): void
{
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        responderError('Método no permitido', 405);
    }
}

// Cualquier error no previsto se responde como JSON (codigo 500) y se anota en el log de Apache.
set_exception_handler(function (Throwable $e): void {
    error_log('HealthyLife API: ' . $e->getMessage());
    responderError('Error interno del servidor', 500);
});

// CORS: permite que la app (ionic serve en localhost:8100) llame a la API desde el navegador.
$origenesPermitidos = ['http://localhost:8100'];
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origen, $origenesPermitidos, true)) {
    header('Access-Control-Allow-Origin: ' . $origen);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Peticion previa (preflight): el navegador pregunta si puede enviar la peticion real.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
