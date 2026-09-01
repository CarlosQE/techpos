"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../prisma/prisma.service', () => ({ PrismaService: jest.fn() }));
jest.mock('../tipo-cambio/tipo-cambio.service', () => ({ TipoCambioService: jest.fn() }));
const dashboard_service_1 = require("./dashboard.service");
const RTX_4070 = { id: '1', sku: 'GPU-RTX4070', nombre: 'RTX 4070', costoUsd: 480, margenPorcentaje: 25, stock: 10 };
const RAM_16GB = { id: '2', sku: 'RAM-16GB', nombre: 'RAM 16GB', costoUsd: 40, margenPorcentaje: 50, stock: 2 };
describe('DashboardService.obtenerKpis (RF-4.1)', () => {
    let prisma;
    let tipoCambioService;
    let service;
    beforeEach(() => {
        prisma = { producto: { findMany: jest.fn().mockResolvedValue([RTX_4070, RAM_16GB]) } };
        tipoCambioService = { findUltimo: jest.fn().mockResolvedValue({ valorOficial: 11.52 }) };
        service = new dashboard_service_1.DashboardService(prisma, tipoCambioService);
    });
    it('calcula el valor total de inventario en USD (costo * stock, sumado)', async () => {
        const kpis = await service.obtenerKpis();
        // 480*10 + 40*2 = 4880
        expect(kpis.valorTotalInventarioUsd).toBe(4880);
    });
    it('convierte el inventario a BOB con el tipo de cambio vigente', async () => {
        const kpis = await service.obtenerKpis();
        expect(kpis.valorTotalInventarioBob).toBeCloseTo(4880 * 11.52, 5);
    });
    it('retorna null en BOB si no hay tipo de cambio registrado', async () => {
        tipoCambioService.findUltimo.mockResolvedValue(null);
        const kpis = await service.obtenerKpis();
        expect(kpis.valorTotalInventarioBob).toBeNull();
    });
    it('calcula el margen comercial proyectado ponderado', async () => {
        // ganancia: 480*0.25*10 + 40*0.5*2 = 1200 + 40 = 1240; margen% = 1240/4880*100
        const kpis = await service.obtenerKpis();
        expect(kpis.margenComercialProyectadoPorcentaje).toBeCloseTo((1240 / 4880) * 100, 5);
    });
    it('alerta productos con stock <= 3', async () => {
        const kpis = await service.obtenerKpis();
        expect(kpis.productosStockBajo).toEqual([{ id: '2', sku: 'RAM-16GB', nombre: 'RAM 16GB', stock: 2 }]);
    });
    it('sin productos, retorna KPIs en cero sin dividir por cero', async () => {
        prisma.producto.findMany.mockResolvedValue([]);
        const kpis = await service.obtenerKpis();
        expect(kpis.valorTotalInventarioUsd).toBe(0);
        expect(kpis.margenComercialProyectadoPorcentaje).toBe(0);
        expect(kpis.productosStockBajo).toEqual([]);
    });
});
