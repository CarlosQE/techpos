import { Injectable, computed, inject, signal } from '@angular/core';
import { CatalogoPricingService } from './catalogo-pricing.service';

export interface ProductoParaCarrito {
  id: string;
  nombre: string;
  costoUsd?: number;
  margenPorcentaje?: number;
  precioUsd?: number;
  precioBob?: number;
  stock: number;
}

export type ProductoCarrito = ProductoParaCarrito;

interface EntradaCarrito {
  producto: ProductoParaCarrito;
  cantidad: number;
}

export interface ItemCarrito {
  producto: ProductoParaCarrito;
  cantidad: number;
  precioUnitarioUsd: number;
  precioUnitarioBob: number;
  subtotalUsd: number;
  subtotalBob: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  private readonly _entradas = signal<Map<string, EntradaCarrito>>(new Map<string, EntradaCarrito>());
  private readonly catalogoPricing = inject(CatalogoPricingService);

  readonly items = computed<ItemCarrito[]>(() => {
    const tc = this.catalogoPricing.tipoCambio();
    return Array.from(this._entradas().values()).map((e) => this.construirItem(e.producto, e.cantidad, tc));
  });
  readonly tipoCambio = computed<number>(() => this.catalogoPricing.tipoCambio());

  readonly totalUsd = computed<number>(() =>
    +this.items().reduce((acc, item) => acc + item.subtotalUsd, 0).toFixed(2)
  );

  // Subtotal en Bs (sin impuestos), IVA 13%, IT 3% y total con impuestos,
  // conforme a la normativa boliviana.
  readonly subtotalBob = computed<number>(() =>
    +this.items().reduce((acc, item) => acc + item.subtotalBob, 0).toFixed(2)
  );

  readonly ivaBob = computed<number>(() => +(this.subtotalBob() * 0.13).toFixed(2));

  readonly itBob = computed<number>(() => +(this.subtotalBob() * 0.03).toFixed(2));

  readonly totalConImpuestosBob = computed<number>(() =>
    +(this.subtotalBob() + this.ivaBob() + this.itBob()).toFixed(2)
  );

  // Compatibilidad: total Bob sin impuestos (subtotal).
  readonly totalBob = computed<number>(() => this.subtotalBob());

  actualizarTipoCambio(tipoCambio: number): void {
    this.catalogoPricing.actualizarTipoCambio(tipoCambio);
  }

  agregar(producto: ProductoParaCarrito, cantidad = 1): void {
    const entradas = new Map<string, EntradaCarrito>(this._entradas());
    const existente = entradas.get(producto.id);
    const cantidadTotal = (existente?.cantidad ?? 0) + cantidad;

    if (cantidadTotal > producto.stock) {
      throw new Error('Stock insuficiente');
    }

    entradas.set(producto.id, { producto, cantidad: cantidadTotal });
    this._entradas.set(entradas);
  }

  actualizarCantidad(productoId: string, cantidad: number): void {
    const entradas = new Map<string, EntradaCarrito>(this._entradas());
    const entrada = entradas.get(productoId);

    if (!entrada) {
      return;
    }

    if (cantidad <= 0) {
      entradas.delete(productoId);
    } else {
      if (cantidad > entrada.producto.stock) {
        throw new Error('Stock insuficiente');
      }
      entradas.set(productoId, { producto: entrada.producto, cantidad });
    }

    this._entradas.set(entradas);
  }

  remover(productoId: string): void {
    const entradas = new Map<string, EntradaCarrito>(this._entradas());
    entradas.delete(productoId);
    this._entradas.set(entradas);
  }

  vaciar(): void {
    this._entradas.set(new Map<string, EntradaCarrito>());
  }

  limpiar(): void {
    this.vaciar();
  }

  private obtenerPrecioVentaUsd(producto: ProductoParaCarrito): number {
    if (typeof producto.precioUsd === 'number') {
      return producto.precioUsd;
    }
    if (typeof producto.costoUsd === 'number' && typeof producto.margenPorcentaje === 'number') {
      return +(producto.costoUsd * (1 + producto.margenPorcentaje / 100)).toFixed(2);
    }
    if (typeof producto.costoUsd === 'number') {
      return producto.costoUsd;
    }
    return 0;
  }

  private construirItem(producto: ProductoParaCarrito, cantidad: number, tipoCambio: number): ItemCarrito {
    const precioUnitarioUsd = this.obtenerPrecioVentaUsd(producto);
    const precioUnitarioBob = +(precioUnitarioUsd * tipoCambio).toFixed(2);
    const subtotalUsd = +(precioUnitarioUsd * cantidad).toFixed(2);
    const subtotalBob = +(subtotalUsd * tipoCambio).toFixed(2);

    return {
      producto,
      cantidad,
      precioUnitarioUsd,
      precioUnitarioBob,
      subtotalUsd,
      subtotalBob
    };
  }
}