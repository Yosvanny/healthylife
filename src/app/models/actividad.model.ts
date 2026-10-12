export type TipoActividad = 'gimnasio' | 'caminar' | 'correr' | 'bicicleta' | 'otra';
export type Intensidad = 'baja' | 'media' | 'alta';

export interface RegistroActividad {
  id?: number;
  usuarioId: number;
  fechaHora: string;
  tipo: TipoActividad;
  nombre: string; // Por ejemplo: "Sentadillas" o "Caminata al parque"
  duracionMin: number;
  intensidad?: Intensidad;
  notas?: string;
}