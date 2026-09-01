"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../prisma/prisma.service', () => ({ PrismaService: jest.fn() }));
const tipo_cambio_service_1 = require("./tipo-cambio.service");
describe('TipoCambioService', () => {
    let prisma;
    let service;
    beforeEach(() => {
        prisma = { tipoCambio: { upsert: jest.fn(), findFirst: jest.fn() } };
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
    it('upsertDiario siempre reemplaza el valor del dia sin importar el origen previo', async () => {
        await service.upsertDiario(new Date('2026-08-26T15:42:00'), 11.52, 'MANUAL');
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { valorOficial: 11.52, origen: 'MANUAL' },
        }));
    });
    it('ajustarManual guarda el valor del dia con origen MANUAL (RF-1.4)', async () => {
        await service.ajustarManual(12.1);
        expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: { valorOficial: 12.1, origen: 'MANUAL' },
            create: expect.objectContaining({ valorOficial: 12.1, origen: 'MANUAL' }),
        }));
    });
    it('findUltimo consulta el registro mas reciente por fecha', async () => {
        await service.findUltimo();
        expect(prisma.tipoCambio.findFirst).toHaveBeenCalledWith({ orderBy: { fecha: 'desc' } });
    });
});
