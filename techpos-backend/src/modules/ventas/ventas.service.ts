import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { calcularPrecioBob, calcularPrecioUsd, redondearCentavos } from '../../common/pricing.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CrearVentaDto } from './dto/crear-venta.dto';

// Normativa boliviana: IVA 13% e IT 3%, calculados sobre el total de la venta.
const IVA_PORCENTAJE = 0.13;
const IT_PORCENTAJE = 0.03;

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  // RF-3.3 — Transacción Atómica: verificar stock, descontar, crear
  // Venta+DetalleVenta, todo dentro de un único prisma.$transaction. Si
  // cualquier item falla, Prisma revierte todo (no quedan ventas parciales).
  async crearVenta(dto: CrearVentaDto) {
    return this.prisma.$transaction(async (tx) => {
      const tipoCambioVigente = await tx.tipoCambio.findFirst({ orderBy: { fecha: 'desc' } });
      if (!tipoCambioVigente) {
        throw new UnprocessableEntityException('No hay tipo de cambio registrado; no se puede procesar la venta');
      }

      const detalles: {
        productoId: string;
        cantidad: number;
        precioUnitarioUsd: number;
        precioUnitarioBob: number;
      }[] = [];
      let totalUsd = 0;

      for (const item of dto.items) {
        const producto = await tx.producto.findUnique({ where: { id: item.productoId } });
        if (!producto) {
          throw new NotFoundException(`Producto "${item.productoId}" no encontrado`);
        }
        if (producto.stock < item.cantidad) {
          throw new ConflictException(
            `Stock insuficiente para "${producto.nombre}" (disponible: ${producto.stock}, pedido: ${item.cantidad})`,
          );
        }

        const precioUnitarioUsd = calcularPrecioUsd(producto.costoUsd, producto.margenPorcentaje);
        const precioUnitarioBob = calcularPrecioBob(precioUnitarioUsd, tipoCambioVigente.valorOficial);

        await tx.producto.update({
          where: { id: producto.id },
          data: { stock: { decrement: item.cantidad } },
        });

        detalles.push({ productoId: producto.id, cantidad: item.cantidad, precioUnitarioUsd, precioUnitarioBob });
        totalUsd += precioUnitarioUsd * item.cantidad;
      }

      const totalUsdRedondeado = redondearCentavos(totalUsd);
      const subtotalBob = redondearCentavos(totalUsdRedondeado * tipoCambioVigente.valorOficial);
      const ivaBob = redondearCentavos(subtotalBob * IVA_PORCENTAJE);
      const itBob = redondearCentavos(subtotalBob * IT_PORCENTAJE);
      const totalConImpuestosBob = redondearCentavos(subtotalBob + ivaBob + itBob);

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
}
