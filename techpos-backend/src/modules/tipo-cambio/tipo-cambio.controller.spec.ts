import { ServiceUnavailableException } from '@nestjs/common';
import { TipoCambioController } from './tipo-cambio.controller';
import type { BcbScraperService, CotizacionVigente } from './bcb-scraper.service';
import type { TipoCambioService } from './tipo-cambio.service';

describe('TipoCambioController', () => {
  let bcbScraperService: jest.Mocked<Pick<BcbScraperService, 'obtenerVigenteConFallback'>>;
  let tipoCambioService: jest.Mocked<Pick<TipoCambioService, 'ajustarManual'>>;
  let controller: TipoCambioController;

  beforeEach(() => {
    bcbScraperService = { obtenerVigenteConFallback: jest.fn() };
    tipoCambioService = { ajustarManual: jest.fn() };
    controller = new TipoCambioController(
      bcbScraperService as unknown as BcbScraperService,
      tipoCambioService as unknown as TipoCambioService,
    );
  });

  it('POST /tipo-cambio/sincronizar retorna la cotización vigente', async () => {
    const cotizacion: CotizacionVigente = {
      valorOficial: 11.52,
      origen: 'BCB_AUTO' as CotizacionVigente['origen'],
      fecha: new Date('2026-08-26'),
      esFallback: false,
    };
    bcbScraperService.obtenerVigenteConFallback.mockResolvedValue(cotizacion);

    await expect(controller.sincronizar()).resolves.toEqual(cotizacion);
  });

  it('traduce el fallo del scraper a 503 Service Unavailable', async () => {
    bcbScraperService.obtenerVigenteConFallback.mockRejectedValue(
      new Error('Scraping falló y no existe ninguna cotización histórica en BD'),
    );

    await expect(controller.sincronizar()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('POST /tipo-cambio/manual delega el ajuste manual al service', async () => {
    const registroManual = { valorOficial: 12.1, origen: 'MANUAL', fecha: new Date('2026-08-26') };
    tipoCambioService.ajustarManual.mockResolvedValue(registroManual as never);

    await expect(controller.ajustarManual({ valorOficial: 12.1 })).resolves.toEqual(registroManual);
    expect(tipoCambioService.ajustarManual).toHaveBeenCalledWith(12.1);
  });
});
