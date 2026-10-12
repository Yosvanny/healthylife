export interface RegistroSueno {
  id?: number;
  usuarioId: number;
  horaAcostarse: string; // Fecha y hora completas: '2026-10-11 23:30:00'
  horaDespertar: string; // Puede ser del día siguiente: '2026-10-12 07:00:00'
  calidad: 1 | 2 | 3 | 4 | 5; // Calidad percibida por el usuario
  notas?: string;
}