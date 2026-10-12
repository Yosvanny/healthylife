export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  metaAguaMl: number; // Meta diaria de agua configurable
  fechaRegistro: string; // 'AAAA-MM-DD HH:MM:SS'
}