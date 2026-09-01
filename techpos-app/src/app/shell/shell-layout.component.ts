import { CommonModule } from '@angular/common';
import { Component, TemplateRef, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TipoCambioApiService } from '../core/api/tipo-cambio-api.service';
import { CatalogoPricingService } from '../core/pricing/catalogo-pricing.service';

// HU-14 (RF-1.3 / RF-1.4) — Shell: barra superior con el chip de TC vigente,
// botón "Sincronizar" y el diálogo de ajuste manual. El chip se alimenta de
// CatalogoPricingService.tipoCambio (HU-08), que el resto de la app también
// consume, así el catálogo/POS se actualizan solos al sincronizar (RF-2.4).
@Component({
  selector: 'tp-shell-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.scss',
})
export class ShellLayoutComponent {
  private readonly tipoCambioApi = inject(TipoCambioApiService);
  private readonly catalogoPricing = inject(CatalogoPricingService);
  private readonly dialog = inject(MatDialog);

  readonly tipoCambioVigente = this.catalogoPricing.tipoCambio;
  readonly sincronizando = signal(false);
  readonly ultimaSincronizacionEsFallback = signal(false);

  readonly navLinks = [
    { ruta: '/catalogo', etiqueta: 'Catálogo', icono: 'inventory_2' },
    { ruta: '/pos', etiqueta: 'Punto de venta', icono: 'point_of_sale' },
    { ruta: '/dashboard', etiqueta: 'Dashboard', icono: 'dashboard' },
  ];

  readonly chipTexto = computed(() => {
    const tc = this.tipoCambioVigente();
    return tc > 0 ? `1 USD = ${tc.toFixed(2)} Bs` : 'Sin cotización';
  });

  readonly valorManual = signal<number | null>(null);
  readonly mostrarGatito = signal(false);
  private clicksLogo = 0;

  abrirGatito(): void {
    this.clicksLogo++;
    if (this.clicksLogo >= 10) {
      this.clicksLogo = 0;
      this.mostrarGatito.set(true);
    }
  }

  cerrarGatito(): void {
    this.mostrarGatito.set(false);
  }

  constructor() {
    this.sincronizar();
  }

  sincronizar(): void {
    this.sincronizando.set(true);
    this.tipoCambioApi.sincronizar().subscribe({
      next: (cotizacion) => {
        this.catalogoPricing.actualizarTipoCambio(cotizacion.valorOficial);
        this.ultimaSincronizacionEsFallback.set(cotizacion.esFallback);
        this.sincronizando.set(false);
      },
      error: () => {
        this.sincronizando.set(false);
      },
    });
  }

  abrirAjusteManual(dialogTemplate: TemplateRef<unknown>): void {
    this.valorManual.set(null);
    this.dialog.open(dialogTemplate, { width: '360px' });
  }

  confirmarAjusteManual(): void {
    const valor = this.valorManual();
    if (!valor || valor <= 0) return;
    this.tipoCambioApi.ajustarManual(valor).subscribe((cotizacion) => {
      this.catalogoPricing.actualizarTipoCambio(cotizacion.valorOficial);
      this.dialog.closeAll();
    });
  }
}
