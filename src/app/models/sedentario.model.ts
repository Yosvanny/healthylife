export interface RegistroSedentario {
  id?: number;
  usuarioId: number;
  fecha: string; // 'AAAA-MM-DD'
  minutos: number;
  notas?: string;
}