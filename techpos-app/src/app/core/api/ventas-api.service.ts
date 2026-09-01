import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface ItemVentaPayload {
  productoId: string;
  cantidad: number;
}

export interface DetalleVentaDto {
  productoId: string;
  cantidad: number;
  precioUnitarioUsd: number;
  precioUnitarioBob: number;
}

export interface VentaDto {
  id: string;
  fechaHora: string;
  tipoCambioAplicado: number;
  totalUsd: number;
  totalBob: number;
  subtotalBob: number;
  iva13Porcentaje: number;
  ivaBob: number;
  it3Porcentaje: number;
  itBob: number;
  totalConImpuestosBob: number;
  detalles: DetalleVentaDto[];
}

const URL = `${API_BASE_URL}/ventas`;

@Injectable({ providedIn: 'root' })
export class VentasApiService {
  constructor(private readonly http: HttpClient) {}

  // RF-3.3 — cierra la venta; el backend hace la transacción atómica.
  crear(items: ItemVentaPayload[]): Observable<VentaDto> {
    return this.http.post<VentaDto>(URL, { items });
  }
}
