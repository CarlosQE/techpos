import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface ProductoStockBajoDto {
  id: string;
  sku: string;
  nombre: string;
  stock: number;
}

export interface KpisDto {
  valorTotalInventarioUsd: number;
  valorTotalInventarioBob: number | null;
  margenComercialProyectadoPorcentaje: number;
  productosStockBajo: ProductoStockBajoDto[];
}

const URL = `${API_BASE_URL}/dashboard`;

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  constructor(private readonly http: HttpClient) {}

  obtenerKpis(): Observable<KpisDto> {
    return this.http.get<KpisDto>(`${URL}/kpis`);
  }
}
