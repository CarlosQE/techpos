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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoCambioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const origen_cotizacion_1 = require("./origen-cotizacion");
function inicioDelDia(fecha) {
    const normalizada = new Date(fecha);
    normalizada.setHours(0, 0, 0, 0);
    return normalizada;
}
let TipoCambioService = class TipoCambioService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    upsertDiario(fecha, valorOficial, origen = origen_cotizacion_1.OrigenCotizacion.BCB_AUTO) {
        const fechaCorte = inicioDelDia(fecha);
        return this.prisma.tipoCambio.upsert({
            where: { fecha: fechaCorte },
            update: { valorOficial, origen },
            create: { fecha: fechaCorte, valorOficial, origen },
        });
    }
    findUltimo() {
        return this.prisma.tipoCambio.findFirst({ orderBy: { fecha: 'desc' } });
    }
    // RF-1.4 — Ajuste Manual: sobreescribe la cotización del día con origen MANUAL.
    ajustarManual(valorOficial) {
        return this.upsertDiario(new Date(), valorOficial, origen_cotizacion_1.OrigenCotizacion.MANUAL);
    }
};
exports.TipoCambioService = TipoCambioService;
exports.TipoCambioService = TipoCambioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TipoCambioService);
