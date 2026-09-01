import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';

// Prisma reporta violaciones de constraint único con code "P2002"; se evita
// importar el tipo de error de @prisma/client (no disponible sin el engine
// generado) y se detecta por duck-typing.
function esViolacionDeUnicidad(error: unknown): boolean {
  return typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2002';
}

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async crear(dto: CrearProductoDto) {
    try {
      return await this.prisma.producto.create({ data: dto });
    } catch (error) {
      if (esViolacionDeUnicidad(error)) {
        throw new ConflictException(`Ya existe un producto con SKU "${dto.sku}"`);
      }
      throw error;
    }
  }

  listar() {
    return this.prisma.producto.findMany({ orderBy: { nombre: 'asc' } });
  }

  // RF-3.1 — Búsqueda rápida por SKU/nombre con filtro de categoría.
  // NOTA: sin `mode: 'insensitive'` porque el connector SQLite no lo soporta;
  // LIKE de SQLite ya es case-insensitive para ASCII por defecto.
  buscar(termino?: string, categoria?: string) {
    return this.prisma.producto.findMany({
      where: {
        ...(categoria ? { categoria } : {}),
        ...(termino
          ? { OR: [{ sku: { contains: termino } }, { nombre: { contains: termino } }] }
          : {}),
      },
      orderBy: { nombre: 'asc' },
      take: 20,
    });
  }

  async obtener(id: string) {
    const producto = await this.prisma.producto.findUnique({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto "${id}" no encontrado`);
    }
    return producto;
  }

  async actualizar(id: string, dto: ActualizarProductoDto) {
    await this.obtener(id);
    try {
      return await this.prisma.producto.update({ where: { id }, data: dto });
    } catch (error) {
      if (esViolacionDeUnicidad(error)) {
        throw new ConflictException(`Ya existe un producto con SKU "${dto.sku}"`);
      }
      throw error;
    }
  }

  async eliminar(id: string) {
    await this.obtener(id);
    return this.prisma.producto.delete({ where: { id } });
  }
}
