import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { TipoCambioService } from './tipo-cambio.service';

// El BCB muestra el TCO vigente en el widget "Tipo de cambio oficial" de su
// portada. El valor está en el span con clase "bcb-tco-num" (ej: "11,92").
const BCB_TCO_URL = 'https://www.bcb.gob.bo/';

export interface CotizacionVigente {
  valorOficial: number;
  origen: string; // 'BCB_AUTO' | 'MANUAL' — String en BD (SQLite no soporta enum)
  fecha: Date;
  esFallback: boolean;
}

@Injectable()
export class BcbScraperService {
  private readonly logger = new Logger(BcbScraperService.name);

  constructor(private readonly tipoCambioService: TipoCambioService) {}

  @Cron('30 20 * * 1-5', { timeZone: 'America/La_Paz' })
  async scrapeDiario(): Promise<void> {
    try {
      await this.obtenerVigenteConFallback();
    } catch (error) {
      // Ni el scraping ni el histórico en BD dieron una cotización: el cron
      // igual no debe crashear, solo queda registrado el incidente.
      this.logger.error('Sin cotización disponible: falló el scraping y no hay histórico en BD', error as Error);
    }
  }

  // RF-1.2 — Fallback Engine: si el scraping falla, se recurre a la última
  // cotización válida en BD en vez de interrumpir la operación del sistema.
  async obtenerVigenteConFallback(): Promise<CotizacionVigente> {
    try {
      const valor = await this.obtenerTcoVigente();
      // Sincronizar siempre re-nivela al valor oficial del BCB, aunque hoy se
      // haya hecho un ajuste manual: la fuente de verdad es el scraper.
      const registro = await this.tipoCambioService.upsertDiario(new Date(), valor);
      this.logger.log(`TCO actualizado: ${registro.valorOficial} Bs/USD`);
      return { valorOficial: registro.valorOficial, origen: registro.origen, fecha: registro.fecha, esFallback: false };
    } catch (error) {
      this.logger.warn('Scraping BCB falló, usando última cotización válida en BD', error as Error);
      const ultimo = await this.tipoCambioService.findUltimo();
      if (!ultimo) {
        throw new Error('Scraping falló y no existe ninguna cotización histórica en BD');
      }
      return { valorOficial: ultimo.valorOficial, origen: ultimo.origen, fecha: ultimo.fecha, esFallback: true };
    }
  }

  async obtenerTcoVigente(): Promise<number> {
    const { data: html } = await axios.get<string>(BCB_TCO_URL, { timeout: 10_000 });
    return this.parsearTcoVigente(html);
  }

  // El widget "Tipo de cambio oficial" de la portada publica el TCO vigente
  // en un span con clase "bcb-tco-num" (ej: "11,92" o "11.92").
  parsearTcoVigente(html: string): number {
    const $ = cheerio.load(html);
    const valores = $('.bcb-tco-num')
      .map((_, el) => $(el).text().trim())
      .get();

    if (valores.length === 0) {
      throw new Error('No se encontró el widget de tipo de cambio oficial en la portada del BCB');
    }

    const valorTexto = valores[0];
    // El widget publica el valor con coma decimal (ej: "11,92") o punto (ej: "11.92").
    const valor = Number.parseFloat(valorTexto.replace(',', '.'));

    if (Number.isNaN(valor)) {
      throw new Error(`No se pudo parsear el TCO desde: "${valorTexto}"`);
    }

    return valor;
  }
}
