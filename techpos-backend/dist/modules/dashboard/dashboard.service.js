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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const tipo_cambio_service_1 = require("../tipo-cambio/tipo-cambio.service");
const UMBRAL_STOCK_BAJO = 3;
let DashboardService = class DashboardService {
    constructor(prisma, tipoCambioService) {
        this.prisma = prisma;
        this.tipoCambioService = tipoCambioService;
    }
    // RF-4.1 — KPIs: valor de inventario en USD/BOB, margen proyectado y
    // alerta de stock bajo (<= 3 unidades).
    async obtenerKpis() {
        const [productos, tipoCambioVigente] = await Promise.all([
            this.prisma.producto.findMany(),
            this.tipoCambioService.findUltimo(),
        ]);
        const valorTotalInventarioUsd = productos.reduce((acumulado, p) => acumulado + p.costoUsd * p.stock, 0);
        const gananciaProyectadaUsd = productos.reduce((acumulado, p) => acumulado + p.costoUsd * (p.margenPorcentaje / 100) * p.stock, 0);
        const margenComercialProyectadoPorcentaje = valorTotalInventarioUsd > 0 ? (gananciaProyectadaUsd / valorTotalInventarioUsd) * 100 : 0;
        const tipoCambio = tipoCambioVigente?.valorOficial ?? null;
        return {
            valorTotalInventarioUsd,
            valorTotalInventarioBob: tipoCambio !== null ? valorTotalInventarioUsd * tipoCambio : null,
            margenComercialProyectadoPorcentaje,
            productosStockBajo: productos
                .filter((p) => p.stock <= UMBRAL_STOCK_BAJO)
                .map((p) => ({ id: p.id, sku: p.sku, nombre: p.nombre, stock: p.stock })),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        tipo_cambio_service_1.TipoCambioService])
], DashboardService);
