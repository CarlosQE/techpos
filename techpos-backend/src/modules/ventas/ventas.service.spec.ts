jest.mock('../../prisma/prisma.service', () => ({ PrismaService: jest.fn() }));

import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { VentasService } from './ventas.service';
import type { PrismaService } from '../../prisma/prisma.service';

const TIPO_CAMBIO_VIGENTE = { valorOficial: 11.52, origen: 'BCB_AUTO', fecha: new Date('2026-08-26') };

const RTX_4070 = {
  id: 'prod-1',
  sku: 'GPU-RTX4070',
  nombre: 'RTX 4070',
  categoria: 'GPU',
  costoUsd: 480,
  margenPorcentaje: 25,
  stock: 10,
};

describe('VentasService.crearVenta (RF-3.3)', () => {
  let tx: {
    tipoCambio: { findFirst: jest.Mock };
    producto: { findUnique: jest.Mock; update: jest.Mock };
    venta: { create: jest.Mock };
  };
  let prisma: { $transaction: jest.Mock };
  let service: VentasService;

  beforeEach(() => {
    tx = {
      tipoCambio: { findFirst: jest.fn().mockResolvedValue(TIPO_CAMBIO_VIGENTE) },
      producto: { findUnique: jest.fn().mockResolvedValue(RTX_4070), update: jest.fn() },
      venta: { create: jest.fn().mockImplementation(({ data }) => ({ id: 'venta-1', ...data, detalles: data.detalles.create })) },
    };
    prisma = { $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)) };
    service = new VentasService(prisma as unknown as PrismaService);
  });

  it('crea la venta congelando el tipo de cambio y los precios unitarios', async () => {
    const venta = await service.crearVenta({ items: [{ productoId: 'prod-1', cantidad: 2 }] });

    // precioUsd = 480 * 1.25 = 600; totalUsd = 1200; totalBob(subtotal) = 1200 * 11.52
    expect(venta.tipoCambioAplicado).toBe(11.52);
    expect(venta.totalUsd).toBe(1200);
    expect(venta.totalBob).toBeCloseTo(1200 * 11.52, 5);
    expect(venta.detalles).toEqual([
      { productoId: 'prod-1', cantidad: 2, precioUnitarioUsd: 600, precioUnitarioBob: 600 * 11.52 },
    ]);
  });

  it('calcula IVA 13% e IT 3% sobre el subtotal y el total con impuestos (normativa boliviana)', async () => {
    const venta = await service.crearVenta({ items: [{ productoId: 'prod-1', cantidad: 2 }] });

    // subtotal = 1200 * 11.52 = 13824
    expect(venta.subtotalBob).toBeCloseTo(13824, 2);
    expect(venta.iva13Porcentaje).toBe(0.13);
    expect(venta.ivaBob).toBeCloseTo(13824 * 0.13, 2);
    expect(venta.it3Porcentaje).toBe(0.03);
    expect(venta.itBob).toBeCloseTo(13824 * 0.03, 2);
    const esperado = 13824 + 13824 * 0.13 + 13824 * 0.03;
    expect(venta.totalConImpuestosBob).toBeCloseTo(esperado, 2);
  });

  it('descuenta el stock del producto vendido', async () => {
    await service.crearVenta({ items: [{ productoId: 'prod-1', cantidad: 2 }] });

    expect(tx.producto.update).toHaveBeenCalledWith({
      where: { id: 'prod-1' },
      data: { stock: { decrement: 2 } },
    });
  });

  it('rechaza la venta si el stock es insuficiente (y no crea la venta)', async () => {
    tx.producto.findUnique.mockResolvedValue({ ...RTX_4070, stock: 1 });

    await expect(service.crearVenta({ items: [{ productoId: 'prod-1', cantidad: 5 }] })).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(tx.venta.create).not.toHaveBeenCalled();
    expect(tx.producto.update).not.toHaveBeenCalled();
  });

  it('rechaza la venta si un producto no existe', async () => {
    tx.producto.findUnique.mockResolvedValue(null);

    await expect(service.crearVenta({ items: [{ productoId: 'inexistente', cantidad: 1 }] })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rechaza la venta si no hay tipo de cambio registrado', async () => {
    tx.tipoCambio.findFirst.mockResolvedValue(null);

    await expect(service.crearVenta({ items: [{ productoId: 'prod-1', cantidad: 1 }] })).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
  });

  it('suma correctamente el total de una venta con múltiples items', async () => {
    const RAM = { id: 'prod-2', sku: 'RAM-16GB', nombre: 'RAM 16GB', costoUsd: 40, margenPorcentaje: 50, stock: 20 };
    tx.producto.findUnique.mockResolvedValueOnce(RTX_4070).mockResolvedValueOnce(RAM);

    const venta = await service.crearVenta({
      items: [
        { productoId: 'prod-1', cantidad: 1 }, // 480*1.25 = 600
        { productoId: 'prod-2', cantidad: 2 }, // 40*1.5=60 c/u -> 120
      ],
    });

    expect(venta.totalUsd).toBe(720);
  });
});
