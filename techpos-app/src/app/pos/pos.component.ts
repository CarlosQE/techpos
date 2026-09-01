import { CommonModule } from '@angular/common';
import { Component, TemplateRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductosApiService } from '../core/api/productos-api.service';
import { VentasApiService } from '../core/api/ventas-api.service';
import { CarritoService, ProductoParaCarrito } from '../core/pricing/carrito.service';
import { CatalogoPricingService } from '../core/pricing/catalogo-pricing.service';
import { Ticket, construirTicket } from '../core/pricing/ticket.utils';

// HU-16 (RF-3.1/3.2/3.3) — POS: busca en el backend (HU-09), agrega al
// carrito en memoria (HU-10) y al cobrar delega la transacción atómica al
// backend (HU-11). El ticket (HU-12) se arma con lo que ya cerró el backend,
// no con el carrito local, para reflejar el precio realmente congelado.
@Component({
  selector: 'tp-pos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
  ],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss',
})
export class PosComponent {
  private readonly productosApi = inject(ProductosApiService);
  private readonly ventasApi = inject(VentasApiService);
  private readonly catalogoPricing = inject(CatalogoPricingService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly carrito = inject(CarritoService);
  readonly terminoBusqueda = signal('');
  readonly resultados = signal<ProductoParaCarrito[]>([]);
  readonly cobrando = signal(false);
  readonly ticket = signal<Ticket | null>(null);

  buscar(termino: string): void {
    this.terminoBusqueda.set(termino);
    if (!termino) {
      this.resultados.set([]);
      return;
    }
    this.productosApi.buscar(termino).subscribe((productos) => this.resultados.set(productos));
  }

  agregarAlCarrito(producto: ProductoParaCarrito): void {
    try {
      this.carrito.agregar(producto, 1);
    } catch (error) {
      this.snackBar.open((error as Error).message, 'Cerrar', { duration: 4000 });
    }
  }

  cambiarCantidad(productoId: string, cantidad: number): void {
    try {
      this.carrito.actualizarCantidad(productoId, cantidad);
    } catch (error) {
      this.snackBar.open((error as Error).message, 'Cerrar', { duration: 4000 });
    }
  }

  cobrar(dialogoTicket: TemplateRef<unknown>): void {
    const items = this.carrito.items();
    if (items.length === 0) return;

    this.cobrando.set(true);
    const payload = items.map((item) => ({ productoId: item.producto.id, cantidad: item.cantidad }));

    this.ventasApi.crear(payload).subscribe({
      next: (venta) => {
        this.ticket.set(construirTicket(items, venta.tipoCambioAplicado, new Date(venta.fechaHora)));
        this.carrito.vaciar();
        this.cobrando.set(false);
        this.dialog.open(dialogoTicket, { width: '340px' });
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No se pudo cerrar la venta';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
        this.cobrando.set(false);
      },
    });
  }

  imprimirTicket(): void {
    window.print();
  }
}
