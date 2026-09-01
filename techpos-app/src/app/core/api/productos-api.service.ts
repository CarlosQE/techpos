import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface ProductoDto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  costoUsd: number;
  margenPorcentaje: number;
  stock: number;
}

export interface CrearProductoPayload {
  sku: string;
  nombre: string;
  categoria: string;
  costoUsd: number;
  margenPorcentaje: number;
  stock: number;
}

const URL = `${API_BASE_URL}/productos`;

@Injectable({ providedIn: 'root' })
export class ProductosApiService {
  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ProductoDto[]> {
    return this.http.get<ProductoDto[]>(URL);
  }

  // RF-3.1 — usado por el buscador del POS con mat-autocomplete.
  buscar(termino?: string, categoria?: string): Observable<ProductoDto[]> {
    const params: Record<string, string> = {};
    if (termino) params['q'] = termino;
    if (categoria) params['categoria'] = categoria;
    return this.http.get<ProductoDto[]>(`${URL}/buscar`, { params });
  }

  crear(payload: CrearProductoPayload): Observable<ProductoDto> {
    return this.http.post<ProductoDto>(URL, payload);
  }
}
