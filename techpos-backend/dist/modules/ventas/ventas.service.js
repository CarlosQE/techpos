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
exports.VentasService = void 0;
const common_1 = require("@nestjs/common");
const pricing_util_1 = require("../../common/pricing.util");
const prisma_service_1 = require("../../prisma/prisma.service");
// Normativa boliviana: IVA 13% e IT 3%, calculados sobre el total de la venta.
const IVA_PORCENTAJE = 0.13;
const IT_PORCENTAJE = 0.03;
let VentasService = class VentasService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    // RF-3.3 — Transacción Atómica: verificar stock, descontar, crear
    // Venta+DetalleVenta, todo dentro de un único prisma.$transaction. Si
    // cualquier item falla, Prisma revierte todo (no quedan ventas parciales).
    async crearVenta(dto) {
        return this.prisma.$transaction(async (tx) => {
            const tipoCambioVigente = await tx.tipoCambio.findFirst({ orderBy: { fecha: 'desc' } });
            if (!tipoCambioVigente) {
                throw new common_1.UnprocessableEntityException('No hay tipo de cambio registrado; no se puede procesar la venta');
            }
            const detalles = [];
            let totalUsd = 0;
            for (const item of dto.items) {
                const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
                if (!producto) {
                    throw new common_1.NotFoundException(`Producto "${item.productoId}" no encontrado`);
                }
                if (producto.stock < item.cantidad) {
                    throw new common_1.ConflictException(`Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}, pedido: ${item.cantidad})`);
                }
                const precioUnitarioUsd = (0, pricing_util_1.calcularPrecioUsd)(producto.costoUsd, producto.margenPorcentaje);
                const precioUnitarioBob = (0, pricing_util_1.calcularPrecioBob)(precioUnitarioUsd, tipoCambioVigente.valorOficial);
                await tx.producto.update({
                    where: { id: producto.id },
                    data: { stock: { decrement: item.cantidad } },
                });
                detalles.push({ productoId: producto.id, cantidad: item.cantidad, precioUnitarioUsd, precioUnitarioBob });
                totalUsd += precioUnitarioUsd * item.cantidad;
            }
            const totalUsdRedondeado = (0, pricing_util_1.redondearCentavos)(totalUsd);
            const subtotalBob = (0, pricing_util_1.redondearCentavos)(totalUsdRedondeado * tipoCambioVigente.valorOficial);
            const ivaBob = (0, pricing_util_1.redondearCentavos)(subtotalBob * IVA_PORCENTAJE);
            const itBob = (0, pricing_util_1.redondearCentavos)(subtotalBob * IT_PORCENTAJE);
            const totalConImpuestosBob = (0, pricing_util_1.redondearCentavos)(subtotalBob + ivaBob + itBob);
            return tx.venta.create({
                data: {
                    tipoCambioAplicado: tipoCambioVigente.valorOficial,
                    totalUsd: totalUsdRedondeado,
                    totalBob: subtotalBob,
                    subtotalBob,
                    iva13Porcentaje: IVA_PORCENTAJE,
                    ivaBob,
                    it3Porcentaje: IT_PORCENTAJE,
                    itBob,
                    totalConImpuestosBob,
                    detalles: { create: detalles },
                },
                include: { detalles: true },
            });
        });
    }
};
exports.VentasService = VentasService;
exports.VentasService = VentasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VentasService);
