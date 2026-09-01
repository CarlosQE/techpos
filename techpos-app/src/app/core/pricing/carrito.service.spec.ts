import { TestBed } from '@angular/core/testing';
import { CarritoService, ProductoParaCarrito } from './carrito.service';
import { CatalogoPricingService } from './catalogo-pricing.service';

const RTX_4070: ProductoParaCarrito = { id: '1', nombre: 'RTX 4070', costoUsd: 480, margenPorcentaje: 25, stock: 3 };

describe('CarritoService (RF-3.2)', () => {
  let carrito: CarritoService;
  let catalogoPricing: CatalogoPricingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    carrito = TestBed.inject(CarritoService);
    catalogoPricing = TestBed.inject(CatalogoPricingService);
    catalogoPricing.actualizarTipoCambio(11.52);
  });

  it('agrega un producto y calcula su subtotal', () => {
    carrito.agregar(RTX_4070, 2);

    const [item] = carrito.items();
    expect(item.cantidad).toBe(2);
    expect(item.subtotalUsd).toBe(1200); // 600 * 2
  });

  it('suma cantidades si se agrega el mismo producto de nuevo', () => {
    carrito.agregar(RTX_4070, 1);
    carrito.agregar(RTX_4070, 1);

    expect(carrito.items().length).toBe(1);
    expect(carrito.items()[0].cantidad).toBe(2);
  });

  it('rechaza agregar más unidades que el stock disponible', () => {
    expect(() => carrito.agregar(RTX_4070, 5)).toThrowError('Stock insuficiente');
  });

  it('rechaza que la cantidad acumulada supere el stock', () => {
    carrito.agregar(RTX_4070, 2);
    expect(() => carrito.agregar(RTX_4070, 2)).toThrowError('Stock insuficiente');
  });

  it('actualizarCantidad a 0 quita el item del carrito', () => {
    carrito.agregar(RTX_4070, 1);
    carrito.actualizarCantidad('1', 0);

    expect(carrito.items().length).toBe(0);
  });

  it('totalUsd/totalBob suman todos los items', () => {
    carrito.agregar(RTX_4070, 1);
    expect(carrito.totalUsd()).toBe(600);
    expect(carrito.totalBob()).toBeCloseTo(600 * 11.52, 5);
  });

  it('recalcula los subtotales en vivo si cambia el tipo de cambio', () => {
    carrito.agregar(RTX_4070, 1);
    expect(carrito.totalBob()).toBeCloseTo(600 * 11.52, 5);
    const bobInicial = carrito.totalBob();

    carrito.actualizarTipoCambio(12.0);

    expect(carrito.totalBob()).not.toBe(bobInicial);
    expect(carrito.totalBob()).toBeCloseTo(600 * 12.0, 5);
  });

  it('vaciar limpia todos los items', () => {
    carrito.agregar(RTX_4070, 1);
    carrito.vaciar();
    expect(carrito.items().length).toBe(0);
  });
});
