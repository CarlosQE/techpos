import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoCambioService } from '../tipo-cambio/tipo-cambio.service';

const UMBRAL_STOCK_BAJO = 3;

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tipoCambioService: TipoCambioService,
  ) {}

  // RF-4.1 — KPIs: valor de inventario en USD/BOB, margen proyectado y
  // alerta de stock bajo (<= 3 unidades).
  async obtenerKpis() {
    const [productos, tipoCambioVigente] = await Promise.all([
      this.prisma.producto.findMany(),
      this.tipoCambioService.findUltimo(),
    ]);

    const valorTotalInventarioUsd = productos.reduce((acumulado, p) => acumulado + p.costoUsd * p.stock, 0);
    const gananciaProyectadaUsd = productos.reduce(
      (acumulado, p) => acumulado + p.costoUsd * (p.margenPorcentaje / 100) * p.stock,
      0,
    );
    const margenComercialProyectadoPorcentaje =
      valorTotalInventarioUsd > 0 ? (gananciaProyectadaUsd / valorTotalInventarioUsd) * 100 : 0;

    const tipoCambio = tipoCambioVigente?.valorOficial ?? null;

    return {
      valorTotalInventarioUsd,
      valorTotalInventarioBob: tipoCambio !== null ? valorTotalInventarioUsd * tipoCambio : null,
      margenComercialProyectadoPorcentaje,
      productosStockBajo: productos
        .filter((p) => p.stock <= UMBRAL_STOCK_BAJO)
        .map((p) => ({ id: p.id, sku: p.sku, nombre: p.nombre, stock: p.stock })),
    };
  }
}
