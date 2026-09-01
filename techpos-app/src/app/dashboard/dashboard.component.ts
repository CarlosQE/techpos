import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardApiService, KpisDto } from '../core/api/dashboard-api.service';

// HU-17 (RF-4.1) — Dashboard: consulta los KPIs ya calculados por el backend
// (HU-13); esta pantalla solo presenta, no recalcula nada.
@Component({
  selector: 'tp-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dashboardApi = inject(DashboardApiService);

  readonly kpis = signal<KpisDto | null>(null);
  readonly cargando = signal(true);
  readonly error = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(false);
    this.dashboardApi.obtenerKpis().subscribe({
      next: (kpis) => {
        this.kpis.set(kpis);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.error.set(true);
      },
    });
  }
}
