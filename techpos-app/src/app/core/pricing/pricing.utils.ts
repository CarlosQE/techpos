// RF-2.3 — Cálculo Reactivo en Memoria. Puro y sin efectos secundarios:
// se ejecuta en el frontend, nunca en el backend (el backend solo guarda
// costoUsd y margenPorcentaje — ver RF-2.2).

export function calcularPrecioUsd(costoUsd: number, margenPorcentaje: number): number {
  return costoUsd * (1 + margenPorcentaje / 100);
}

export function calcularPrecioBob(precioUsd: number, tipoCambio: number): number {
  return precioUsd * tipoCambio;
}
