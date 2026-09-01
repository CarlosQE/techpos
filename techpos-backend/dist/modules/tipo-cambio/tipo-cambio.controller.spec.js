"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const tipo_cambio_controller_1 = require("./tipo-cambio.controller");
describe('TipoCambioController', () => {
    let bcbScraperService;
    let tipoCambioService;
    let controller;
    beforeEach(() => {
        bcbScraperService = { obtenerVigenteConFallback: jest.fn() };
        tipoCambioService = { ajustarManual: jest.fn() };
        controller = new tipo_cambio_controller_1.TipoCambioController(bcbScraperService, tipoCambioService);
    });
    it('POST /tipo-cambio/sincronizar retorna la cotización vigente', async () => {
        const cotizacion = {
            valorOficial: 11.52,
            origen: 'BCB_AUTO',
            fecha: new Date('2026-08-26'),
            esFallback: false,
        };
        bcbScraperService.obtenerVigenteConFallback.mockResolvedValue(cotizacion);
        await expect(controller.sincronizar()).resolves.toEqual(cotizacion);
    });
    it('traduce el fallo del scraper a 503 Service Unavailable', async () => {
        bcbScraperService.obtenerVigenteConFallback.mockRejectedValue(new Error('Scraping falló y no existe ninguna cotización histórica en BD'));
        await expect(controller.sincronizar()).rejects.toBeInstanceOf(common_1.ServiceUnavailableException);
    });
    it('POST /tipo-cambio/manual delega el ajuste manual al service', async () => {
        const registroManual = { valorOficial: 12.1, origen: 'MANUAL', fecha: new Date('2026-08-26') };
        tipoCambioService.ajustarManual.mockResolvedValue(registroManual);
        await expect(controller.ajustarManual({ valorOficial: 12.1 })).resolves.toEqual(registroManual);
        expect(tipoCambioService.ajustarManual).toHaveBeenCalledWith(12.1);
    });
});
