import { Injectable, computed, signal } from '@angular/core';
import { calcularPrecioBob, calcularPrecioUsd } from './pricing.utils';

export interface ProductoBase {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  costoUsd: number;
  margenPorcentaje: number;
  stock: number;
}

export interface ProductoConPrecios extends ProductoBase {
  precioUsd: number;
  precioBob: number;
}

// RF-2.4 — Recálculo en Vivo: cuando cambia la cotización (o el catálogo),
// `productosConPrecios` se recalcula solo, sin refrescar la página y sin
// llamar al backend (ver RF-2.2/2.3).
@Injectable({ providedIn: 'root' })
export class CatalogoPricingService {
  private readonly _productos = signal<ProductoBase[]>([]);
  private readonly _tipoCambio = signal<number>(0);

  readonly tipoCambio = this._tipoCambio.asReadonly();

  readonly productosConPrecios = computed<ProductoConPrecios[]>(() => {
    const tc = this._tipoCambio();
    return this._productos().map((producto) => {
      const precioUsd = calcularPrecioUsd(producto.costoUsd, producto.margenPorcentaje);
      return { ...producto, precioUsd, precioBob: calcularPrecioBob(precioUsd, tc) };
    });
  });

  cargarProductos(productos: ProductoBase[]): void {
    this._productos.set(productos);
  }

  actualizarTipoCambio(valor: number): void {
    this._tipoCambio.set(valor);
  }
}
