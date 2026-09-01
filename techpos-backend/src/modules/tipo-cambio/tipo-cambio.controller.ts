import { Body, Controller, HttpCode, HttpStatus, Post, ServiceUnavailableException } from '@nestjs/common';
import { BcbScraperService, CotizacionVigente } from './bcb-scraper.service';
import { AjustarTipoCambioDto } from './dto/ajustar-tipo-cambio.dto';
import { TipoCambioService } from './tipo-cambio.service';

@Controller('tipo-cambio')
export class TipoCambioController {
  constructor(
    private readonly bcbScraperService: BcbScraperService,
    private readonly tipoCambioService: TipoCambioService,
  ) {}

  // Botón "Sincronizar" de la barra superior: fuerza el scraping bajo demanda.
  @Post('sincronizar')
  @HttpCode(HttpStatus.OK)
  async sincronizar(): Promise<CotizacionVigente> {
    try {
      return await this.bcbScraperService.obtenerVigenteConFallback();
    } catch (error) {
      throw new ServiceUnavailableException((error as Error).message);
    }
  }

  // RF-1.4 — Admin ingresa manualmente el TC para contingencias de mercado.
  @Post('manual')
  @HttpCode(HttpStatus.OK)
  ajustarManual(@Body() dto: AjustarTipoCambioDto) {
    return this.tipoCambioService.ajustarManual(dto.valorOficial);
  }
}
