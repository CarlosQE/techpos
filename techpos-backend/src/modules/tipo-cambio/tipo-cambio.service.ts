import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OrigenCotizacion } from './origen-cotizacion';

function inicioDelDia(fecha: Date): Date {
  const normalizada = new Date(fecha);
  normalizada.setHours(0, 0, 0, 0);
  return normalizada;
}

@Injectable()
export class TipoCambioService {
  constructor(private readonly prisma: PrismaService) {}

  upsertDiario(fecha: Date, valorOficial: number, origen: OrigenCotizacion = OrigenCotizacion.BCB_AUTO) {
    const fechaCorte = inicioDelDia(fecha);
    return this.prisma.tipoCambio.upsert({
      where: { fecha: fechaCorte },
      update: { valorOficial, origen },
      create: { fecha: fechaCorte, valorOficial, origen },
    });
  }

  findUltimo() {
    return this.prisma.tipoCambio.findFirst({ orderBy: { fecha: 'desc' } });
  }

  // RF-1.4 — Ajuste Manual: sobreescribe la cotización del día con origen MANUAL.
  ajustarManual(valorOficial: number) {
    return this.upsertDiario(new Date(), valorOficial, OrigenCotizacion.MANUAL);
  }
}
