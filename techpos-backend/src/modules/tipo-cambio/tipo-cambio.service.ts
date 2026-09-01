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

  // RF-1.2/1.4 — Al sincronizar con el BCB se respeta un ajuste MANUAL hecho
  // en el día: el valor de contingencia del admin no se pisa con el del portal.
  async sincronizarDiario(fecha: Date, valorOficial: number) {
    const fechaCorte = inicioDelDia(fecha);
    const existente = await this.prisma.tipoCambio.findUnique({ where: { fecha: fechaCorte } });

    if (existente?.origen === OrigenCotizacion.MANUAL) {
      return existente;
    }

    return this.prisma.tipoCambio.upsert({
      where: { fecha: fechaCorte },
      update: { valorOficial, origen: OrigenCotizacion.BCB_AUTO },
      create: { fecha: fechaCorte, valorOficial, origen: OrigenCotizacion.BCB_AUTO },
    });
  }

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
