import { CommonModule } from '@angular/common';
import { Component, TemplateRef, inject, signal } from '@angular/core';
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
// recalcula solo cuando el Shell sincroniza el tipo de cambio. El mismo
// formulario sirve para alta (HU-15) y edición (HU-16), precargando los datos
// y permitiendo modificar todo, incluso el SKU.
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
  readonly columnas = ['sku', 'nombre', 'categoria', 'costoUsd', 'margenPorcentaje', 'precioUsd', 'precioBob', 'stock', 'acciones'];

  readonly editandoId = signal<string | null>(null);
  readonly formularioProducto = this.fb.nonNullable.group({
    sku: ['', [this.skuValidator]],
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
    this.editandoId.set(null);
    this.formularioProducto.reset({ sku: '', nombre: '', categoria: '', costoUsd: 0, margenPorcentaje: 0, stock: 0 });
    this.dialog.open(dialogTemplate, { width: '460px' });
  }

  abrirEdicionProducto(producto: { id: string; sku: string; nombre: string; categoria: string; costoUsd: number; margenPorcentaje: number; stock: number }, dialogTemplate: TemplateRef<unknown>): void {
    this.editandoId.set(producto.id);
    this.formularioProducto.setValue({
      sku: producto.sku,
      nombre: producto.nombre,
      categoria: producto.categoria,
      costoUsd: producto.costoUsd,
      margenPorcentaje: producto.margenPorcentaje,
      stock: producto.stock,
    });
    this.dialog.open(dialogTemplate, { width: '460px' });
  }

  guardarProducto(): void {
    if (this.formularioProducto.invalid) return;

    const { sku, ...resto } = this.formularioProducto.getRawValue();
    const id = this.editandoId();
    const payload = {
      ...resto,
      // En alta, SKU vacío => autogenerado por el backend. En edición se
      // envía siempre (vacío no está permitido porque ya existe asignado).
      ...(id ? { sku } : sku.trim() ? { sku } : {}),
    };

    const accion = id
      ? this.productosApi.actualizar(id, payload)
      : this.productosApi.crear(payload);

    accion.subscribe({
      next: () => {
        this.dialog.closeAll();
        this.cargarCatalogo();
        this.snackBar.open(id ? 'Producto actualizado' : 'Producto agregado al catálogo', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        const mensaje = error?.error?.message ?? 'No se pudo guardar el producto';
        this.snackBar.open(mensaje, 'Cerrar', { duration: 4000 });
      },
    });
  }

  // Valida que el SKU sea un código numérico de 3 dígitos; vacío es válido en
  // alta (se autogenera), pero en edición se conserva/lo elige el usuario.
  private skuValidator(control: { value: string }): { skuInvalido: true } | null {
    const valor = (control.value ?? '').trim();
    if (valor === '') return null;
    return /^\d{3}$/.test(valor) ? null : { skuInvalido: true };
  }
}
