// Resumen calculado de un día; no se guarda, se obtiene de los registros.
export interface ResumenDia {
  suenoMinutos: number;
  aguaMl: number;
  bebidasTotalMl: number; // Todas las bebidas, incluida el agua
  metaAguaMl: number;
  comidasRegistradas: number;
  caloriasEstimadas: number;
  actividadMinutos: number;
  sedentarioMinutos: number;
}