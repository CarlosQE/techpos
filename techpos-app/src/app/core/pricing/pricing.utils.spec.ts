import { calcularPrecioBob, calcularPrecioUsd } from './pricing.utils';

describe('pricing.utils (RF-2.3)', () => {
  it('calcularPrecioUsd aplica el margen sobre el costo', () => {
    expect(calcularPrecioUsd(480, 25)).toBe(600);
  });

  it('calcularPrecioUsd con margen 0 retorna el costo íntegro', () => {
    expect(calcularPrecioUsd(100, 0)).toBe(100);
  });

  it('calcularPrecioBob convierte el precio USD al tipo de cambio vigente', () => {
    expect(calcularPrecioBob(600, 11.52)).toBeCloseTo(6912, 5);
  });
});
