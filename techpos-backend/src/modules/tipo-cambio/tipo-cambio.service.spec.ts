jest.mock('../../prisma/prisma.service', () => ({ PrismaService: jest.fn() }));

import { TipoCambioService } from './tipo-cambio.service';
import type { PrismaService } from '../../prisma/prisma.service';

describe('TipoCambioService', () => {
  let prisma: { tipoCambio: { upsert: jest.Mock; findFirst: jest.Mock } };
  let service: TipoCambioService;

  beforeEach(() => {
    prisma = { tipoCambio: { upsert: jest.fn(), findFirst: jest.fn() } };
    service = new TipoCambioService(prisma as unknown as PrismaService);
  });

  it('upsertDiario normaliza la fecha a medianoche con origen BCB_AUTO por defecto', async () => {
    await service.upsertDiario(new Date('2026-08-26T15:42:00'), 11.52);

    expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { fecha: new Date('2026-08-26T00:00:00') },
        update: { valorOficial: 11.52, origen: 'BCB_AUTO' },
        create: { fecha: new Date('2026-08-26T00:00:00'), valorOficial: 11.52, origen: 'BCB_AUTO' },
      }),
    );
  });

  it('upsertDiario siempre reemplaza el valor del dia sin importar el origen previo', async () => {
    await service.upsertDiario(new Date('2026-08-26T15:42:00'), 11.52, 'MANUAL' as any);

    expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { valorOficial: 11.52, origen: 'MANUAL' },
      }),
    );
  });

  it('ajustarManual guarda el valor del dia con origen MANUAL (RF-1.4)', async () => {
    await service.ajustarManual(12.1);

    expect(prisma.tipoCambio.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { valorOficial: 12.1, origen: 'MANUAL' },
        create: expect.objectContaining({ valorOficial: 12.1, origen: 'MANUAL' }),
      }),
    );
  });

  it('findUltimo consulta el registro mas reciente por fecha', async () => {
    await service.findUltimo();

    expect(prisma.tipoCambio.findFirst).toHaveBeenCalledWith({ orderBy: { fecha: 'desc' } });
  });
});
