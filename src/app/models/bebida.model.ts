export type TipoBebida = 'agua' | 'cafe' | 'jugo' | 'refresco' | 'otra';

export interface RegistroBebida {
  id?: number;
  usuarioId: number;
  fechaHora: string;
  tipo: TipoBebida;
  cantidadMl: number;
}
