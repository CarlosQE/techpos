import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface CotizacionVigenteDto {
  valorOficial: number;
  origen: string;
  fecha: string;
  esFallback: boolean;
}

const URL = `${API_BASE_URL}/tipo-cambio`;

@Injectable({
  providedIn: 'root'
})
export class TipoCambioApiService {
  constructor(private readonly http: HttpClient) {}

  // Botón "Sincronizar" del shell (RF-1.3)
  sincronizar(): Observable<CotizacionVigenteDto> {
    return this.http.post<CotizacionVigenteDto>(`${URL}/sincronizar`, {});
  }

  // Ajuste manual del Admin ante contingencias (RF-1.4)
  ajustarManual(valorOficial: number): Observable<CotizacionVigenteDto> {
    return this.http.post<CotizacionVigenteDto>(`${URL}/manual`, { valorOficial });
  }
}