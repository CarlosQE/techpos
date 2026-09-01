"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const bcb_scraper_service_1 = require("./bcb-scraper.service");
// Factory explícita: evita cargar el archivo real (y su dependencia del
// engine de Prisma, no disponible en el entorno de test) para el DI token.
jest.mock('./tipo-cambio.service', () => ({ TipoCambioService: jest.fn() }));
jest.mock('axios');
const mockedAxios = axios_1.default;
const HTML_TCO_VALIDO = `
  <article class="bcb-kpi2-card is-tc-oficial has-range-label">
    <div class="bcb-kpi2-body">
      <div class="bcb-tco-value">
        <div class="bcb-tco-amount">
          <span class="bcb-tco-num">11,92</span>
        </div>
      </div>
    </div>
  </article>`;
const registroUpsert = {
    id: 'tc-1',
    valorOficial: 11.52,
    origen: 'BCB_AUTO',
    fecha: new Date('2026-08-26'),
    createdAt: new Date('2026-08-26'),
};
const registroHistorico = {
    id: 'tc-0',
    valorOficial: 11.45,
    origen: 'BCB_AUTO',
    fecha: new Date('2026-08-25'),
    createdAt: new Date('2026-08-25'),
};
describe('BcbScraperService', () => {
    let tipoCambioService;
    let scraper;
    beforeEach(() => {
        jest.clearAllMocks();
        tipoCambioService = {
            sincronizarDiario: jest.fn().mockResolvedValue(registroUpsert),
            upsertDiario: jest.fn().mockResolvedValue(registroUpsert),
            findUltimo: jest.fn().mockResolvedValue(null),
        };
        scraper = new bcb_scraper_service_1.BcbScraperService(tipoCambioService);
    });
    describe('parsearTcoVigente', () => {
        it('extrae el valor del widget de tipo de cambio oficial de la portada', () => {
            expect(scraper.parsearTcoVigente(HTML_TCO_VALIDO)).toBe(11.92);
        });
        it('tolera punto decimal en el número (ej: 11.92)', () => {
            const htmlPunto = '<span class="bcb-tco-num">11.92</span>';
            expect(scraper.parsearTcoVigente(htmlPunto)).toBe(11.92);
        });
        it('lanza error si no existe el widget de tipo de cambio', () => {
            expect(() => scraper.parsearTcoVigente('<div>vacío</div>')).toThrow('No se encontró el widget de tipo de cambio oficial');
        });
        it('lanza error si el valor no es numérico', () => {
            const htmlRoto = '<span class="bcb-tco-num">N/D</span>';
            expect(() => scraper.parsearTcoVigente(htmlRoto)).toThrow('No se pudo parsear el TCO');
        });
    });
    describe('obtenerVigenteConFallback (RF-1.2)', () => {
        it('retorna el valor recién scrapeado cuando el BCB responde', async () => {
            mockedAxios.get.mockResolvedValue({ data: HTML_TCO_VALIDO });
            const resultado = await scraper.obtenerVigenteConFallback();
            expect(tipoCambioService.sincronizarDiario).toHaveBeenCalledWith(expect.any(Date), 11.92);
            expect(tipoCambioService.findUltimo).not.toHaveBeenCalled();
            expect(resultado).toEqual({
                valorOficial: registroUpsert.valorOficial,
                origen: registroUpsert.origen,
                fecha: registroUpsert.fecha,
                esFallback: false,
            });
        });
        it('recurre a la última cotización en BD si el scraping falla', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Timeout BCB'));
            tipoCambioService.findUltimo.mockResolvedValue(registroHistorico);
            const resultado = await scraper.obtenerVigenteConFallback();
            expect(resultado).toEqual({
                valorOficial: registroHistorico.valorOficial,
                origen: registroHistorico.origen,
                fecha: registroHistorico.fecha,
                esFallback: true,
            });
            expect(tipoCambioService.upsertDiario).not.toHaveBeenCalled();
        });
        it('lanza error si el scraping falla y no hay histórico en BD', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Timeout BCB'));
            tipoCambioService.findUltimo.mockResolvedValue(null);
            await expect(scraper.obtenerVigenteConFallback()).rejects.toThrow('Scraping falló y no existe ninguna cotización histórica en BD');
        });
    });
    describe('scrapeDiario', () => {
        it('guarda el TCO scrapeado con la fecha del día', async () => {
            mockedAxios.get.mockResolvedValue({ data: HTML_TCO_VALIDO });
            await scraper.scrapeDiario();
            expect(tipoCambioService.sincronizarDiario).toHaveBeenCalledTimes(1);
            expect(tipoCambioService.sincronizarDiario).toHaveBeenCalledWith(expect.any(Date), 11.92);
        });
        it('usa el fallback y no propaga error si el scraping falla pero hay histórico', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Timeout BCB'));
            tipoCambioService.findUltimo.mockResolvedValue(registroHistorico);
            await expect(scraper.scrapeDiario()).resolves.toBeUndefined();
            expect(tipoCambioService.upsertDiario).not.toHaveBeenCalled();
        });
        it('no crashea ni con scraping fallido ni sin histórico en BD', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Timeout BCB'));
            tipoCambioService.findUltimo.mockResolvedValue(null);
            await expect(scraper.scrapeDiario()).resolves.toBeUndefined();
        });
    });
});
