import { HttpErrorResponse } from '@angular/common/http';
import { RespuestaError } from '../models/respuesta-api.model';

// Convierte cualquier error de una peticion en un texto entendible para el usuario.
export function mensajeDeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    // status 0: no hubo respuesta (sin internet, XAMPP apagado o CORS bloqueado).
    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    }

    // La API siempre responde {"ok": false, "error": "..."} cuando algo sale mal.
    const cuerpo = error.error as Partial<RespuestaError> | null;
    if (cuerpo && typeof cuerpo.error === 'string') {
      return cuerpo.error;
    }
  }

  return 'Ocurrió un error inesperado. Intenta de nuevo.';
}
