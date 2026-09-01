import { CommonModule } from '@angular/common';
import { Component, TemplateRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ProductosApiService } from '../core/api/productos-api.service';
import { CatalogoPricingService } from '../core/pricing/catalogo-pricing.service';

// HU-15 (RF-2.1/2.4) — Catálogo: carga los productos del backend y delega el
// cálculo de precios USD/BOB a CatalogoPricingService (HU-07/08), que se
// recalcula solo cuando el Shell sincroniza el tipo de cambio.
@Component({
  selector: 'tp-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './catalogo.component.html',
  styleUrl: './catalogo.component.scss',
})
export class CatalogoComponent {
  private readonly productosApi = inject(ProductosApiService);
  private readonly catalogoPricing = inject(CatalogoPricingService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);

  readonly productos = this.catalogoPricing.productosConPrecios;
  readonly columnas = ['sku', 'nombre', 'categoria', 'costoUsd', 'margenPorcentaje', 'precioUsd', 'precioBob', 'stock'];

  readonly formularioProducto = this.fb.nonNullable.group({
    sku: ['', Validators.required],
    nombre: ['', Validators.required],
    categoria: ['', Validators.required],
    costoUsd: [0, [Validators.required, Validators.min(0.01)]],
    margenPorcentaje: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    this.cargarCatalogo();
  }

  cargarCatalogo(): void {
    this.productosApi.listar().subscribe((productos) => this.catalogoPricing.cargarProductos(productos));
  }

  abrirAltaProducto(dialogTemplate: TemplateRef<unknown>): void {
    this.formularioProducto.reset({ sku: '', nombre: '', categoria: '', costoUsd: 0, margenPorcentaje: 0, stock: 0 });
    this.dialog.open(dialogTemplate, { width: '420px' });
  }

  guardarProducto(): void {
    if (this.formularioProducto.invalid) return;

    this.productosApi.crear(this.formularioProducto.getRawValue()).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.cargarCatalogo();
        this.snackBar.open('Producto agregado al catálogo', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No se pudo guardar el producto';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
      },
    });
  }
}
