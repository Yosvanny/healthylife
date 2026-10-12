export type TipoComida = 'desayuno' | 'comida' | 'cena' | 'colacion';

export interface RegistroComida {
  id?: number;
  usuarioId: number;
  fechaHora: string;
  tipoComida: TipoComida;
  alimentos: string; // Descripción: "2 huevos, 1 tortilla"
  porcion?: string; // Porción aproximada
  calorias?: number; // Estimadas; vacías si no se conocen
  proteinasG?: number;
  carbohidratosG?: number;
  grasasG?: number;
}