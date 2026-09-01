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
exports.ProductosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
// Prisma reporta violaciones de constraint único con code "P2002"; se evita
// importar el tipo de error de @prisma/client (no disponible sin el engine
// generado) y se detecta por duck-typing.
function esViolacionDeUnicidad(error) {
    return typeof error === 'object' && error !== null && error.code === 'P2002';
}
let ProductosService = class ProductosService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async crear(dto) {
        try {
            return await this.prisma.producto.create({ data: dto });
        }
        catch (error) {
            if (esViolacionDeUnicidad(error)) {
                throw new common_1.ConflictException(`Ya existe un producto con SKU "${dto.sku}"`);
            }
            throw error;
        }
    }
    listar() {
        return this.prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
    }
    // RF-3.1 — Búsqueda rápida por SKU/nombre con filtro de categoría.
    // NOTA: sin `mode: 'insensitive'` porque el connector SQLite no lo soporta;
    // LIKE de SQLite ya es case-insensitive para ASCII por defecto.
    buscar(termino, categoria) {
        return this.prisma.producto.findMany({
            where: {
                ...(categoria ? { categoria } : {}),
                ...(termino
                    ? { OR: [{ sku: { contains: termino } }, { nombre: { contains: termino } }] }
                    : {}),
            },
            orderBy: { nombre: 'asc' },
            take: 20,
        });
    }
    async obtener(id) {
        const producto = await this.prisma.producto.findUnique({ where: { id } });
        if (!producto) {
            throw new common_1.NotFoundException(`Producto "${id}" no encontrado`);
        }
        return producto;
    }
    async actualizar(id, dto) {
        await this.obtener(id);
        try {
            return await this.prisma.producto.update({ where: { id }, data: dto });
        }
        catch (error) {
            if (esViolacionDeUnicidad(error)) {
                throw new common_1.ConflictException(`Ya existe un producto con SKU "${dto.sku}"`);
            }
            throw error;
        }
    }
    async eliminar(id) {
        await this.obtener(id);
        return this.prisma.producto.delete({ where: { id } });
    }
};
exports.ProductosService = ProductosService;
exports.ProductosService = ProductosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductosService);
