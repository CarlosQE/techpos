"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../prisma/prisma.service', () => ({ PrismaService: jest.fn() }));
const common_1 = require("@nestjs/common");
const productos_service_1 = require("./productos.service");
const PRODUCTO_DTO = {
    sku: 'GPU-RTX4070',
    nombre: 'RTX 4070',
    categoria: 'GPU',
    costoUsd: 480,
    margenPorcentaje: 25,
    stock: 10,
};
const PRODUCTO_GUARDADO = { id: 'uuid-1', ...PRODUCTO_DTO };
describe('ProductosService', () => {
    let prisma;
    let service;
    beforeEach(() => {
        prisma = {
            producto: {
                create: jest.fn(),
                findMany: jest.fn(),
                findUnique: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            },
        };
        service = new productos_service_1.ProductosService(prisma);
    });
    describe('crear', () => {
        it('crea el producto con los datos del DTO', async () => {
            prisma.producto.create.mockResolvedValue(PRODUCTO_GUARDADO);
            await expect(service.crear(PRODUCTO_DTO)).resolves.toEqual(PRODUCTO_GUARDADO);
            expect(prisma.producto.create).toHaveBeenCalledWith({ data: PRODUCTO_DTO });
        });
        it('traduce SKU duplicado (P2002) a ConflictException', async () => {
            prisma.producto.create.mockRejectedValue({ code: 'P2002' });
            await expect(service.crear(PRODUCTO_DTO)).rejects.toBeInstanceOf(common_1.ConflictException);
        });
    });
    describe('buscar (RF-3.1)', () => {
        it('filtra por término (sku o nombre) y categoría, limitando a 20 resultados', async () => {
            prisma.producto.findMany.mockResolvedValue([PRODUCTO_GUARDADO]);
            const resultado = await service.buscar('rtx', 'GPU');
            expect(resultado).toEqual([PRODUCTO_GUARDADO]);
            expect(prisma.producto.findMany).toHaveBeenCalledWith({
                where: { categoria: 'GPU', OR: [{ sku: { contains: 'rtx' } }, { nombre: { contains: 'rtx' } }] },
                orderBy: { nombre: 'asc' },
                take: 20,
            });
        });
        it('sin término ni categoría, lista el catálogo completo (acotado a 20)', async () => {
            await service.buscar();
            expect(prisma.producto.findMany).toHaveBeenCalledWith({
                where: {},
                orderBy: { nombre: 'asc' },
                take: 20,
            });
        });
    });
    describe('obtener', () => {
        it('retorna el producto si existe', async () => {
            prisma.producto.findUnique.mockResolvedValue(PRODUCTO_GUARDADO);
            await expect(service.obtener('uuid-1')).resolves.toEqual(PRODUCTO_GUARDADO);
        });
        it('lanza NotFoundException si no existe', async () => {
            prisma.producto.findUnique.mockResolvedValue(null);
            await expect(service.obtener('inexistente')).rejects.toBeInstanceOf(common_1.NotFoundException);
        });
    });
    describe('actualizar', () => {
        it('actualiza tras verificar que el producto existe', async () => {
            prisma.producto.findUnique.mockResolvedValue(PRODUCTO_GUARDADO);
            prisma.producto.update.mockResolvedValue({ ...PRODUCTO_GUARDADO, stock: 5 });
            const resultado = await service.actualizar('uuid-1', { stock: 5 });
            expect(resultado.stock).toBe(5);
            expect(prisma.producto.update).toHaveBeenCalledWith({ where: { id: 'uuid-1' }, data: { stock: 5 } });
        });
        it('lanza NotFoundException si el producto no existe', async () => {
            prisma.producto.findUnique.mockResolvedValue(null);
            await expect(service.actualizar('inexistente', { stock: 5 })).rejects.toBeInstanceOf(common_1.NotFoundException);
            expect(prisma.producto.update).not.toHaveBeenCalled();
        });
    });
    describe('eliminar', () => {
        it('elimina tras verificar que el producto existe', async () => {
            prisma.producto.findUnique.mockResolvedValue(PRODUCTO_GUARDADO);
            prisma.producto.delete.mockResolvedValue(PRODUCTO_GUARDADO);
            await expect(service.eliminar('uuid-1')).resolves.toEqual(PRODUCTO_GUARDADO);
        });
        it('lanza NotFoundException si el producto no existe', async () => {
            prisma.producto.findUnique.mockResolvedValue(null);
            await expect(service.eliminar('inexistente')).rejects.toBeInstanceOf(common_1.NotFoundException);
            expect(prisma.producto.delete).not.toHaveBeenCalled();
        });
    });
});
