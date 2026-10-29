import { Usuario } from './usuario.model';

// Formato de todas las respuestas de la API de PHP (ver api/utilidades.php).
export interface RespuestaExito<T> {
  ok: true;
  datos: T;
}

export interface RespuestaError {
  ok: false;
  error: string; // Mensaje para mostrar al usuario
}

// Lo que devuelven registro.php y login.php.
export interface SesionIniciada {
  token: string;
  usuario: Usuario;
}
