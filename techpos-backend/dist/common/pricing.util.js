"use strict";
// Misma fórmula que frontend/src/app/core/pricing/pricing.utils.ts (RF-2.3).
// El backend la usa solo para CONGELAR precios al momento de la venta
// (RF-3.3) — el catálogo en pantalla sigue calculándose en el frontend.
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcularPrecioUsd = calcularPrecioUsd;
exports.calcularPrecioBob = calcularPrecioBob;
exports.redondearCentavos = redondearCentavos;
function calcularPrecioUsd(costoUsd, margenPorcentaje) {
    return redondearCentavos(costoUsd * (1 + margenPorcentaje / 100));
}
function calcularPrecioBob(precioUsd, tipoCambio) {
    return redondearCentavos(precioUsd * tipoCambio);
}
// Dinero se maneja al centavo: evita errores de coma flotante tipo
// 5514.599999999999 al persistir precios/totales en la BD (RF-3.3).
function redondearCentavos(valor) {
    return Math.round(valor * 100) / 100;
}
