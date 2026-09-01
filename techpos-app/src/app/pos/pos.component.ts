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
  readonly folio = signal('');

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
        this.ticket.set(
          construirTicket(
            items,
            venta.tipoCambioAplicado,
            new Date(venta.fechaHora),
            {
              subtotalBob: venta.subtotalBob,
              ivaBob: venta.ivaBob,
              itBob: venta.itBob,
              totalConImpuestosBob: venta.totalConImpuestosBob,
            },
          ),
        );
        this.folio.set(this.generarFolio(new Date(venta.fechaHora)));
        this.carrito.vaciar();
        this.cobrando.set(false);
        this.dialog.open(dialogoTicket, { width: '400px' });
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No se pudo cerrar la venta';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
        this.cobrando.set(false);
      },
    });
  }

  // Imprime el ticket en una ventana de impresión independiente, para que el
  // documento se genere de forma limpia (80mm) sin heredar el overlay/padding
  // del diálogo de Angular Material.
  imprimirTicket(): void {
    const t = this.ticket();
    if (!t) return;

    const anio = t.fecha.getFullYear();
    const mes = String(t.fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(t.fecha.getDate()).padStart(2, '0');
    const hora = String(t.fecha.getHours()).padStart(2, '0');
    const min = String(t.fecha.getMinutes()).padStart(2, '0');
    const fecha = `${dia}/${mes}/${anio} ${hora}:${min}`;

    const lineas = t.lineas
      .map(
        (l) => `
        <div class="linea">
          <span class="cant">${l.cantidad}</span>
          <span class="desc">${this.escapeHtml(l.nombre)}<span class="unit">${l.precioUnitarioBob.toFixed(2)} c/u</span></span>
          <span class="monto">${l.subtotalBob.toFixed(2)}</span>
        </div>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Ticket ${this.folio()}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { width: 80mm; margin: 0 auto; font-family: 'Roboto Mono', 'Courier New', monospace; color: #000; font-size: 11px; line-height: 1.35; }
      .encabezado { text-align: center; }
      .marca { display: flex; align-items: center; justify-content: center; gap: 6px; }
      .logo { width: 22px; height: 22px; border-radius: 4px; background: #1a73e8; color: #fff; font-weight: bold; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
      .empresa { font-weight: bold; font-size: 14px; }
      .direccion, .doc { font-size: 10px; opacity: 0.75; }
      .titulo { margin-top: 6px; font-weight: bold; letter-spacing: 0.15em; border: 1px solid #000; border-radius: 3px; padding: 2px 0; }
      .folio { display: flex; justify-content: space-between; margin-top: 5px; font-size: 10px; opacity: 0.75; }
      .regla { height: 2px; background: #000; margin: 6px 0; border-radius: 1px; }
      .regla-fina { height: 1px; opacity: 0.5; margin: 5px 0; }
      .meta { display: flex; justify-content: space-between; font-size: 9px; opacity: 0.75; margin-bottom: 4px; }
      .cabeceras { display: flex; font-weight: bold; font-size: 9px; text-transform: uppercase; letter-spacing: 0.04em; }
      .cant { width: 34px; text-align: center; flex-shrink: 0; }
      .desc { flex: 1; padding: 0 4px; }
      .unit { display: block; font-size: 9px; opacity: 0.75; }
      .monto { min-width: 56px; text-align: right; }
      .linea { display: flex; align-items: flex-start; padding: 1px 0; }
      .resumen { display: flex; flex-direction: column; gap: 1px; }
      .linea-resumen { display: flex; justify-content: space-between; }
      .totales { font-weight: bold; font-size: 13px; padding-top: 3px; }
      .pie { text-align: center; font-size: 9px; opacity: 0.75; }
      .pie p { margin: 1px 0; }
      @media print { body { margin: 0; } }
    </style>
  </head>
  <body>
    <div class="encabezado">
      <div class="marca"><span class="logo">TP</span><span class="empresa">TechPOS S.R.L.</span></div>
      <div class="direccion">Av. Tecnológica N° 1234 — Zona Central</div>
      <div class="doc">NIT: 1029384-0-17 · La Paz - Bolivia</div>
      <div class="titulo">TICKET DE VENTA</div>
      <div class="folio"><span>No. ${this.folio()}</span><span>${fecha}</span></div>
    </div>
    <div class="regla"></div>
    <div class="meta"><span>Tip. de cambio: Bs ${t.tipoCambioAplicado.toFixed(2)}</span><span>Moneda: Bs</span></div>
    <div class="cabeceras"><span class="cant">CANT.</span><span class="desc">DESCRIPCIÓN</span><span class="monto">IMPORTE</span></div>
    <div class="regla-fina"></div>
    ${lineas}
    <div class="regla-fina"></div>
    <div class="resumen">
      <div class="linea-resumen"><span>Subtotal</span><span>${t.subtotalBob.toFixed(2)}</span></div>
      <div class="linea-resumen"><span>IVA (13%)</span><span>${t.ivaBob.toFixed(2)}</span></div>
      <div class="linea-resumen"><span>IT (3%)</span><span>${t.itBob.toFixed(2)}</span></div>
      <div class="regla"></div>
      <div class="linea-resumen totales"><span>TOTAL A PAGAR</span><span>Bs ${t.totalConImpuestosBob.toFixed(2)}</span></div>
    </div>
    <div class="regla"></div>
    <div class="pie"><p>¡Gracias por su compra!</p><p>Artículos vendidos no retornables sin su factura original.</p></div>
  </body>
</html>`;

    const ventana = window.open('', '_blank', 'width=420,height=640');
    if (!ventana) return;
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.onafterprint = () => ventana.close();
  }

  private escapeHtml(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Folio legible y secuencial basado en el timestamp de la venta.
  private generarFolio(fechaHora: Date): string {
    const n = Math.floor(fechaHora.getTime() / 1000).toString();
    return `T-${n.slice(-8)}`;
  }
}
