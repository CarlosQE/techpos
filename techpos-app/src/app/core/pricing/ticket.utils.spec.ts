import { TestBed } from '@angular/core/testing';
import { CarritoService, ProductoParaCarrito } from './carrito.service';
import { CatalogoPricingService } from './catalogo-pricing.service';
import { construirTicket } from './ticket.utils';

const RTX_4070: ProductoParaCarrito = { id: '1', nombre: 'RTX 4070', costoUsd: 480, margenPorcentaje: 25, stock: 3 };

describe('construirTicket (RF-3.4)', () => {
  it('arma las líneas del ticket con precios en BOB y los totales', () => {
    TestBed.configureTestingModule({});
    const catalogoPricing = TestBed.inject(CatalogoPricingService);
    const carrito = TestBed.inject(CarritoService);
    catalogoPricing.actualizarTipoCambio(11.52);
    carrito.agregar(RTX_4070, 2);

    const ticket = construirTicket(carrito.items(), 11.52, new Date('2026-08-26'));

    expect(ticket.tipoCambioAplicado).toBe(11.52);
    expect(ticket.lineas).toEqual([
      { nombre: 'RTX 4070', cantidad: 2, precioUnitarioBob: 600 * 11.52, subtotalBob: 1200 * 11.52 },
    ]);
    expect(ticket.totalUsd).toBe(1200);
    expect(ticket.subtotalBob).toBeCloseTo(1200 * 11.52, 5);
  });

  it('calcula IVA (13%) e IT (3%) y el total con impuestos por defecto', () => {
    TestBed.configureTestingModule({});
    const catalogoPricing = TestBed.inject(CatalogoPricingService);
    const carrito = TestBed.inject(CarritoService);
    catalogoPricing.actualizarTipoCambio(11.52);
    carrito.agregar(RTX_4070, 1);

    const ticket = construirTicket(carrito.items(), 11.52, new Date('2026-08-26'));

    const subtotal = 600 * 11.52;
    expect(ticket.ivaBob).toBeCloseTo(subtotal * 0.13, 5);
    expect(ticket.itBob).toBeCloseTo(subtotal * 0.03, 5);
    expect(ticket.totalConImpuestosBob).toBeCloseTo(subtotal * 1.16, 5);
  });

  it('usa los importes oficiales del backend cuando se pasan los impuestos', () => {
    const ticket = construirTicket([], 11.52, new Date('2026-08-26'), {
      subtotalBob: 1000,
      ivaBob: 130,
      itBob: 30,
      totalConImpuestosBob: 1160,
    });

    expect(ticket.subtotalBob).toBe(1000);
    expect(ticket.ivaBob).toBe(130);
    expect(ticket.itBob).toBe(30);
    expect(ticket.totalConImpuestosBob).toBe(1160);
  });

  it('con carrito vacío retorna un ticket sin líneas y totales en cero', () => {
    const ticket = construirTicket([], 11.52);
    expect(ticket.lineas).toEqual([]);
    expect(ticket.totalUsd).toBe(0);
    expect(ticket.subtotalBob).toBe(0);
    expect(ticket.totalConImpuestosBob).toBe(0);
  });
});
