"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var BcbScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcbScraperService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const tipo_cambio_service_1 = require("./tipo-cambio.service");
// El BCB muestra el TCO vigente en el widget "Tipo de cambio oficial" de su
// portada. El valor está en el span con clase "bcb-tco-num" (ej: "11,92").
const BCB_TCO_URL = 'https://www.bcb.gob.bo/';
let BcbScraperService = BcbScraperService_1 = class BcbScraperService {
    constructor(tipoCambioService) {
        this.tipoCambioService = tipoCambioService;
        this.logger = new common_1.Logger(BcbScraperService_1.name);
    }
    async scrapeDiario() {
        try {
            await this.obtenerVigenteConFallback();
        }
        catch (error) {
            // Ni el scraping ni el histórico en BD dieron una cotización: el cron
            // igual no debe crashear, solo queda registrado el incidente.
            this.logger.error('Sin cotización disponible: falló el scraping y no hay histórico en BD', error);
        }
    }
    // RF-1.2 — Fallback Engine: si el scraping falla, se recurre a la última
    // cotización válida en BD en vez de interrumpir la operación del sistema.
    async obtenerVigenteConFallback() {
        try {
            const valor = await this.obtenerTcoVigente();
            // Sincronizar siempre re-nivela al valor oficial del BCB, aunque hoy se
            // haya hecho un ajuste manual: la fuente de verdad es el scraper.
            const registro = await this.tipoCambioService.upsertDiario(new Date(), valor);
            this.logger.log(`TCO actualizado: ${registro.valorOficial} Bs/USD`);
            return { valorOficial: registro.valorOficial, origen: registro.origen, fecha: registro.fecha, esFallback: false };
        }
        catch (error) {
            this.logger.warn('Scraping BCB falló, usando última cotización válida en BD', error);
            const ultimo = await this.tipoCambioService.findUltimo();
            if (!ultimo) {
                throw new Error('Scraping falló y no existe ninguna cotización histórica en BD');
            }
            return { valorOficial: ultimo.valorOficial, origen: ultimo.origen, fecha: ultimo.fecha, esFallback: true };
        }
    }
    async obtenerTcoVigente() {
        const { data: html } = await axios_1.default.get(BCB_TCO_URL, { timeout: 10_000 });
        return this.parsearTcoVigente(html);
    }
    // El widget "Tipo de cambio oficial" de la portada publica el TCO vigente
    // en un span con clase "bcb-tco-num" (ej: "11,92" o "11.92").
    parsearTcoVigente(html) {
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
};
exports.BcbScraperService = BcbScraperService;
__decorate([
    (0, schedule_1.Cron)('30 20 * * 1-5', { timeZone: 'America/La_Paz' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BcbScraperService.prototype, "scrapeDiario", null);
exports.BcbScraperService = BcbScraperService = BcbScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tipo_cambio_service_1.TipoCambioService])
], BcbScraperService);
