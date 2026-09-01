import { CatalogoPricingService, ProductoBase } from './catalogo-pricing.service';

const RTX_4070: ProductoBase = {
  id: '1',
  sku: 'GPU-RTX4070',
  nombre: 'RTX 4070',
  categoria: 'GPU',
  costoUsd: 480,
  margenPorcentaje: 25,
  stock: 10,
};

describe('CatalogoPricingService (RF-2.4)', () => {
  let service: CatalogoPricingService;

  beforeEach(() => {
    service = new CatalogoPricingService();
  });

  it('calcula precioUsd y precioBob de cada producto del catálogo', () => {
    service.cargarProductos([RTX_4070]);
    service.actualizarTipoCambio(11.52);

    const [producto] = service.productosConPrecios();

    expect(producto.precioUsd).toBe(600);
    expect(producto.precioBob).toBeCloseTo(6912, 5);
  });

  it('recalcula en vivo el precio BOB cuando cambia el tipo de cambio, sin recargar el catálogo', () => {
    service.cargarProductos([RTX_4070]);
    service.actualizarTipoCambio(11.52);
    const precioBobInicial = service.productosConPrecios()[0].precioBob;

    service.actualizarTipoCambio(11.9);
    const precioBobActualizado = service.productosConPrecios()[0].precioBob;

    expect(precioBobActualizado).not.toBe(precioBobInicial);
    expect(precioBobActualizado).toBeCloseTo(600 * 11.9, 5);
  });

  it('no altera el precioUsd al cambiar solo el tipo de cambio', () => {
    service.cargarProductos([RTX_4070]);
    service.actualizarTipoCambio(11.52);
    service.actualizarTipoCambio(12.3);

    expect(service.productosConPrecios()[0].precioUsd).toBe(600);
  });
});
