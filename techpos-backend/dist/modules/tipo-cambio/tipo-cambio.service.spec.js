"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Ya no depende de @prisma/client para OrigenCotizacion (ver origen-cotizacion.ts);
// solo se mockea PrismaService, cuyo engine no está disponible en el entorno de test.
jest.mock('../../prisma/prisma.service', () => ({ PrismaService: jest.fn() }));
const tipo_cambio_service_1 = require("./tipo-cambio.service");
describe('TipoCambioService', () => {
    let prisma;
    let service;
    beforeEach(() => {
        prisma = { tipoCambio: { upsert: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn() } };
        service = new tipo_cambio_service_1.TipoCambioService(prisma);
    });
    it('upsertDiario normaliza la fecha a medianoche con origen BCB_AUTO por defecto', async () => {
        await service.upsertDiario(new Date('2026-08-26T15:42:00'), 11.52);
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { fecha: new Date('2026-08-26T00:00:00') },
            update: { valorOficial: 11.52, origen: 'BCB_AUTO' },
            create: { fecha: new Date('2026-08-26T00:00:00'), valorOficial: 11.52, origen: 'BCB_AUTO' },
        }));
    });
    it('sincronizarDiario no pisa un ajuste MANUAL hecho en el dia (RF-1.4)', async () => {
        prisma.tipoCambio.findUnique.mockResolvedValue({ origen: 'MANUAL', valorOficial: 12.3 });
        const resultado = await service.sincronizarDiario(new Date('2026-08-26T15:42:00'), 11.52);
        expect(resultado).toEqual({ origen: 'MANUAL', valorOficial: 12.3 });
        expect(prisma.tipoCambio.upsert).not.toHaveBeenCalled();
    });
    it('sincronizarDiario guarda el valor BCB si no existe registro previo del dia', async () => {
        prisma.tipoCambio.findUnique.mockResolvedValue(null);
        await service.sincronizarDiario(new Date('2026-08-26T15:42:00'), 11.52);
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: { fecha: new Date('2026-08-26T00:00:00') },
            update: { valorOficial: 11.52, origen: 'BCB_AUTO' },
            create: expect.objectContaining({ valorOficial: 11.52, origen: 'BCB_AUTO' }),
        }));
    });
    it('sincronizarDiario reemplaza un BCB_AUTO previo con el nuevo valor', async () => {
        prisma.tipoCambio.findUnique.mockResolvedValue({ origen: 'BCB_AUTO', valorOficial: 11.92 });
        await service.sincronizarDiario(new Date('2026-08-26T15:42:00'), 11.52);
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledTimes(1);
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { valorOficial: 11.52, origen: 'BCB_AUTO' },
        }));
    });
    it('ajustarManual guarda el valor del día con origen MANUAL (RF-1.4)', async () => {
        await service.ajustarManual(12.1);
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { valorOficial: 12.1, origen: 'MANUAL' },
            create: expect.objectContaining({ valorOficial: 12.1, origen: 'MANUAL' }),
        }));
    });
    it('findUltimo consulta el registro más reciente por fecha', async () => {
        await service.findUltimo();
        expect(prisma.tipoCambio.findFirst).toHaveBeenCalledWith({ orderBy: { fecha: 'desc' } });
    });
});
