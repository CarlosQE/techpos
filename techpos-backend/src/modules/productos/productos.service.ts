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
    const data = { ...dto, sku: dto.sku ?? (await this.generarSku()) };
    if (data.sku) await this.validarUnicoAlCrear(data.sku, data.nombre);
    try {
      return await this.prisma.producto.create({ data });
    } catch (error) {
      if (esViolacionDeUnicidad(error)) {
        throw new ConflictException(this.describirConflicto(error));
      }
      throw error;
    }
  }

  // Genera un SKU secuencial de 3 dígitos (mayor existente + 1, con padding).
  private async generarSku(): Promise<string> {
    const productos = await this.prisma.producto.findMany({
      select: { sku: true },
    });
    const maximo = productos.reduce((acc, p) => {
      const n = parseInt(p.sku, 10);
      return Number.isInteger(n) && n > acc ? n : acc;
    }, 0);
    return String(maximo + 1).padStart(3, '0');
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
    if (dto.sku !== undefined || dto.nombre !== undefined) {
      await this.validarUnicoAlActualizar(id, dto.sku, dto.nombre);
    }
    try {
      return await this.prisma.producto.update({ where: { id }, data: dto });
    } catch (error) {
      if (esViolacionDeUnicidad(error)) {
        throw new ConflictException(this.describirConflicto(error));
      }
      throw error;
    }
  }

  // Detecta SKU/nombre ya usados por OTRO producto, antes de crear/actualizar,
  // para dar mensajes claros de conflicto en lugar de una genérica P2002.
  private async validarUnicoAlCrear(sku?: string, nombre?: string): Promise<void> {
    const existente = await this.prisma.producto.findFirst({
      where: {
        OR: [...(sku ? [{ sku }] : []), ...(nombre ? [{ nombre }] : [])],
      },
      select: { sku: true, nombre: true },
    });
    if (!existente) return;
    if (existente.sku === sku) {
      throw new ConflictException(`Ya existe un producto con el SKU "${sku}"`);
    }
    throw new ConflictException(`Ya existe un producto con el nombre "${nombre}"`);
  }

  private async validarUnicoAlActualizar(
    id: string,
    sku?: string,
    nombre?: string,
  ): Promise<void> {
    const existente = await this.prisma.producto.findFirst({
      where: {
        NOT: { id },
        AND: [
          { OR: [...(sku ? [{ sku }] : []), ...(nombre ? [{ nombre }] : [])] },
        ],
      },
      select: { sku: true, nombre: true },
    });
    if (!existente) return;
    if (sku && existente.sku === sku) {
      throw new ConflictException(`Ya existe un producto con el SKU "${sku}"`);
    }
    throw new ConflictException(`Ya existe un producto con el nombre "${nombre}"`);
  }

  private describirConflicto(error: unknown): string {
    const meta = (error as { meta?: { target?: string[] } }).meta;
    const campo = meta?.target?.[0];
    if (campo === 'sku') return 'Ya existe un producto con ese SKU';
    if (campo === 'nombre') return 'Ya existe un producto con ese nombre';
    return 'Ya existe un producto duplicado';
  }

  async eliminar(id: string) {
    await this.obtener(id);
    return this.prisma.producto.delete({ where: { id } });
  }
}
