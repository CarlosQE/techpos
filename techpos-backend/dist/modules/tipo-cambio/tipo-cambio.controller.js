"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoCambioController = void 0;
const common_1 = require("@nestjs/common");
const bcb_scraper_service_1 = require("./bcb-scraper.service");
const ajustar_tipo_cambio_dto_1 = require("./dto/ajustar-tipo-cambio.dto");
const tipo_cambio_service_1 = require("./tipo-cambio.service");
let TipoCambioController = class TipoCambioController {
    constructor(bcbScraperService, tipoCambioService) {
        this.bcbScraperService = bcbScraperService;
        this.tipoCambioService = tipoCambioService;
    }
    // Botón "Sincronizar" de la barra superior: fuerza el scraping bajo demanda.
    async sincronizar() {
        try {
            return await this.bcbScraperService.obtenerVigenteConFallback();
        }
        catch (error) {
            throw new common_1.ServiceUnavailableException(error.message);
        }
    }
    // RF-1.4 — Admin ingresa manualmente el TC para contingencias de mercado.
    ajustarManual(dto) {
        return this.tipoCambioService.ajustarManual(dto.valorOficial);
    }
};
exports.TipoCambioController = TipoCambioController;
__decorate([
    (0, common_1.Post)('sincronizar'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TipoCambioController.prototype, "sincronizar", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ajustar_tipo_cambio_dto_1.AjustarTipoCambioDto]),
    __metadata("design:returntype", void 0)
], TipoCambioController.prototype, "ajustarManual", null);
exports.TipoCambioController = TipoCambioController = __decorate([
    (0, common_1.Controller)('tipo-cambio'),
    __metadata("design:paramtypes", [bcb_scraper_service_1.BcbScraperService,
        tipo_cambio_service_1.TipoCambioService])
], TipoCambioController);
