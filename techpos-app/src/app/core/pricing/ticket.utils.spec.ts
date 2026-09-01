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
    expect(ticket.totalBob).toBeCloseTo(1200 * 11.52, 5);
  });

  it('con carrito vacío retorna un ticket sin líneas y totales en cero', () => {
    const ticket = construirTicket([], 11.52);
    expect(ticket.lineas).toEqual([]);
    expect(ticket.totalUsd).toBe(0);
    expect(ticket.totalBob).toBe(0);
  });
});
