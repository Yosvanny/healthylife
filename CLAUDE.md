# HealthyLife — contexto para Claude Code

Actualizado: 29/10/2026 (pasos 9-B.5 y 9-B.6 terminados; API de autenticacion completa).

## Tu papel y modo de trabajo

Eres mi mentor de programacion para terminar la app movil HealthyLife (proyecto escolar).
Soy estudiante de Ingenieria en Software. Responde en espanol, con lenguaje sencillo,
traduciendo los terminos en ingles.

**Modo avance:** quiero terminar primero la app. Da el codigo completo de cada paso con
explicaciones breves (que hace y por que), sin preguntas de repaso. Al terminar haremos
un documento que explique todo el codigo y pruebas para entenderlo.

Reglas:

- Trabaja UN paso a la vez de la hoja de ruta. Cada paso se prueba antes del siguiente.
- Antes de escribir o modificar un archivo, dime cual y por que. Revisa el codigo
  existente primero; no inventes archivos, funciones ni dependencias; no dupliques nada.
- No instales dependencias sin explicar para que sirven y si son necesarias.
- Explica antes cualquier operacion destructiva (git restore, borrar, sobrescribir).
- Despues de crear un archivo, verifica que no quedo vacio (`wc -l`, `head`).
- **Commits:** NO hagas commit ni push por tu cuenta. Antes de cada commit muestrame
  `git diff --staged --stat` y `git diff --staged`; yo apruebo. `index e69de29` en un diff
  significa que la version anterior era un ARCHIVO VACIO: revisarlo antes de seguir.
- Nunca afirmes haber probado algo que no ejecutaste. Si una prueba necesita el
  navegador o el panel de XAMPP, pidemela.
- Si falta informacion que afecte la arquitectura, hazme una pregunta concreta.
- Si escribo mal un comando (typos como `--stanged`, `git long`), senalalo.

## Proyecto

App de registro diario de habitos saludables. NO es una app medica ni sustituye a
profesionales. Registra: sueno (duracion calculada, calidad 1-5; sin fases inventadas),
alimentacion (calorias y macros solo si hay datos; no inventar valores), hidratacion
(agua y total de bebidas POR SEPARADO; meta configurable), actividad fisica (calorias no
exactas), tiempo sedentario (captura manual), planes saludables orientativos (sin dietas
extremas), inicio e historial con datos reales. Login real; todos los datos en MySQL
mediante API en PHP.

## Entorno verificado

- Windows + Git Bash + VS Code. Proyecto: C:\dev\movil\proyecto\healthylife
- Node v24.21.0, npm 11.19.0, Ionic CLI 7.2.1, Git 2.49.0 (aviso LF->CRLF es normal).
- Angular 22.1.7, @ionic/angular ^9.0.0, Capacitor 8.5.3, TypeScript ~6.0, Vitest 4.
  App: `ionic serve` en http://localhost:8100
- XAMPP en C:\XAMPP: Apache 2.4.58, **PHP 8.2.12**, MariaDB (aplica CHECK).
  Cliente MySQL: `/c/xampp/mysql/bin/mysql -u root` (root sin contrasena, solo desarrollo).
  Log de errores: /c/xampp/apache/logs/error.log
- Si la API responde 500 con error 2002 en el log: MySQL esta apagado en XAMPP.

## Patrones obligatorios (Angular/Ionic)

- Importar componentes desde '@ionic/angular', NUNCA '@ionic/angular/standalone'.
- Cada etiqueta ion- del HTML necesita su import en `imports` del componente.
- Iconos: `addIcons` de 'ionicons' + 'ionicons/icons' en el constructor.
- Paginas: `ionic generate page pages/NOMBRE` (probar con --dry-run); el generador agrega
  la ruta al final de app.routes.ts y hay que moverla.

## Decisiones de arquitectura

1. 5 pestanas en /tabs (Inicio, Registro, Planes, Historial, Ajustes); login en /login
   FUERA de /tabs.
2. La app nunca se conecta directo a MySQL; las pantallas usan servicios de Angular.
3. MySQL en snake_case; TypeScript en camelCase; la API traduce.
4. Contrasenas con password_hash/password_verify; consultas preparadas PDO.
5. API en healthylife/api/, servida por alias de Apache: http://localhost/healthylife-api/
   (alias en C:\XAMPP\apache\conf\extra\httpd-healthylife.conf, copia en docs/; `Require local`).
6. Validar datos en la API ademas de las reglas CHECK.
7. **Sesion:** token aleatorio (`bin2hex(random_bytes(32))`) entregado al iniciar sesion;
   en la tabla `sesiones` se guarda solo `hash('sha256', token)`; expira en 30 dias.
   La app lo envia en `Authorization: Bearer <token>`. Cerrar sesion borra la fila.
8. **Persistencia:** la base principal es MySQL en XAMPP (se administra con phpMyAdmin).
   En el celular se usa `@capacitor/preferences` (pendiente de instalar) solo para guardar
   el token y una cache de datos para funcionar sin conexion. No usar SQLite.

## Estado actual de la API (todo probado y en GitHub)

- `api/config.ejemplo.php` (en Git) y `api/config.php` (ignorado en .gitignore):
  arreglo con db_host, db_nombre, db_usuario, db_contrasena.
- `api/conexion.php`: `obtenerConexion(): PDO` (static, utf8mb4, ERRMODE_EXCEPTION,
  FETCH_ASSOC, EMULATE_PREPARES false).
- `api/utilidades.php`: `responderJson`, `responderExito($datos, $codigo=200)`,
  `responderError($mensaje, $codigo=400)`, `leerCuerpoJson()`, `exigirMetodo($metodo)`,
  `set_exception_handler` (500 JSON generico + error_log), y CORS al final (solo
  http://localhost:8100; OPTIONS responde 204). Todo endpoint debe hacer
  `require __DIR__ . '/utilidades.php';` PRIMERO y luego conexion.php.
- Formato de respuesta: `{"ok":true,"datos":{...}}` o `{"ok":false,"error":"..."}`.
- `api/index.php`: punto de prueba GET -> {mensaje, php, tablas}.
- `api/auth.php`: `formatearUsuario($fila)` (snake_case -> camelCase, sin password_hash),
  `crearSesion($usuarioId): string` (token; guarda el hash; DIAS_SESION = 30),
  `validarNombre($valor): string` (1-100 caracteres), `obtenerTokenHash(): string` (lee
  Authorization Bearer de 64 hex, con respaldo getallheaders; 401 si falta) y
  `exigirUsuario(): array` (fila de usuarios con sesion vigente; 401 si no existe o expiro).
  Requiere conexion.php cargado antes. **Todo endpoint protegido llama `exigirUsuario()`.**
- `api/registro.php` (POST nombre, email, password): valida nombre 1-100, email valido <=150,
  password 8-72; email en minusculas; 409 si el correo existe; 201 {token, usuario}.
- `api/login.php` (POST email, password): 401 "Correo o contrasena incorrectos" (mismo
  mensaje si el correo no existe); 200 {token, usuario}.
- `api/perfil.php`: GET -> {usuario}; PUT {nombre?, metaAguaMl?} (meta entera 250-10000;
  el campo que no se envia se conserva) -> {usuario}. Otros metodos 405.
- `api/logout.php` (POST con token): borra la fila de sesiones; 401 si ya no existia.
- Usuario de prueba: prueba1793253526@ejemplo.com / secreta123 (id 4).

## Base de datos (database/healthylife.sql, 86 lineas, IF NOT EXISTS, sin DROP)

7 tablas: usuarios (password_hash, meta_agua_ml), registros_sueno, registros_bebida,
registros_comida, registros_actividad, registros_sedentario, sesiones
(usuario_id, token_hash CHAR(64) UNIQUE, fecha_creacion, fecha_expiracion).
Claves foraneas ON DELETE CASCADE; CHECK; ENUM para tipos. Comparar cada modelo de
src/app/models con su tabla antes de escribir endpoints.

## Ultimos commits (main, origin = github.com/Yosvanny/healthylife)

6068e72 CLAUDE.md como evidencia · b3a558f registro e inicio de sesion ·
70c1e50 tabla sesiones · 635ebc0 CORS · 1027cd5 utilidades JSON y errores

## Bloques de entrega del profesor (sin fechas; seguir la hoja de ruta en orden)

1. Modelo de datos, interfaces TS, servicios de Angular, CRUD, Git, diagrama de entidades,
   documento breve de uso de IA en el modelo.  -> pasos 7-14 y 14-A.
2. Persistencia: alta/consulta/modificacion/eliminacion que sobrevive al cerrar la app,
   video, prompts.  -> pasos 8 (token en Preferences) y 9-14.
3. Sin conexion: deteccion de conexion, manejo de errores, mensajes al usuario, cache,
   prueba offline, bitacora con 3+ problemas.  -> paso 15-A.
   (El "bloque 4" era una copia del 3 por error; no existe.)
5. Version 1.0: todo lo anterior + APK o ejecucion demostrable, video <= 5 min, README,
   bitacora de IA.  -> pasos 19-23.

## HOJA DE RUTA (siguiente: paso 7)

B. Autenticacion
  5. HECHO (b3a558f): registro.php y login.php, probados con curl.
  6. HECHO: exigirUsuario, perfil.php y logout.php, probados con curl (incluye token vencido).
C. App: conexion y login
  7. **SIGUIENTE:** HttpClient en main.ts (forma correcta de Angular 22) y URL de la API en environments.
  8. Servicio de autenticacion (token guardado con @capacitor/preferences), paginas /login y
     /registro-usuario fuera de tabs, guard e interceptor que envia el token.
D. Registros diarios (API + servicio + pantalla, uno por uno)
  9. Pestana Registro: menu de tipos y formularios.  10. Hidratacion.  11. Sueno (duracion
  aunque cruce medianoche).  12. Alimentacion.  13. Actividad y sedentario.
  14. Consultar, editar y eliminar registros del dia.
  14-A. Diagrama de entidades (Mermaid, desde el script SQL) y documento de uso de IA en el
        modelo (bloque 1).
E. 15. Inicio con datos reales (endpoint de resumen; esEjemplo = false; selector de fecha).
  15-A. Sin conexion (bloque 3): @capacitor/network, interceptor de errores con mensajes
        (ion-toast), cache en Preferences del resumen y registros del dia, prueba offline.
F. 16. Planes saludables (tablas, datos de ejemplo realistas, seleccion y seguimiento).
G. 17. Historial por fecha y resumenes semanales/mensuales.
H. 18. Configuracion: perfil, meta de agua, cerrar sesion, aviso de limitaciones.
I. 19. Pruebas manuales y Vitest (formatearMinutos, duracion del sueno, porcentajes).
   20. Prueba en celular (IP de la PC; agregar el origen a CORS y ajustar Require local)
       y generar el APK (revisar si hay Android Studio/SDK instalado).
J. 21. README.md.  22. Capturas, video (<= 5 min) y evidencia de prompts.
   23. Documento final del codigo y bitacora de desarrollo asistido por IA.

## Evidencia de uso critico de la IA (para la bitacora)

- Sesiones anteriores: numeros de linea incorrectos, bloques duplicados, imports de
  '@ionic/angular/standalone' descartados, script SQL y modelo de bebida guardados vacios
  (detectados con `wc -l` y `index e69de29`).
- 28/10/2026: la IA indico 87 lineas esperadas para el script SQL; eran 86 (conto mal al
  quitar un CHECK); se verifico el diff. Un 500 se diagnostico con el log de Apache
  (MySQL apagado), no era error del codigo. Typos `git long` y `--stanged` detectados.
- 29/10/2026: CLAUDE.md decia que 70c1e50 ya existia y el snapshot de git status lo
  mostraba como pendiente; se verifico con `git log` antes de actuar. El "bloque 4" del
  profesor era identico al 3; se detecto y se aclaro con el usuario.
