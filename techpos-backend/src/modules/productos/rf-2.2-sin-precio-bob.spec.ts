import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';
import { CrearProductoDto } from './dto/crear-producto.dto';

const PRODUCTO_VALIDO = {
  sku: 'GPU-RTX4070',
  nombre: 'RTX 4070',
  categoria: 'GPU',
  costoUsd: 480,
  margenPorcentaje: 25,
  stock: 10,
};

describe('RF-2.2 — Restricción estricta: nada de precios BOB persistidos', () => {
  it('el ValidationPipe (whitelist + forbidNonWhitelisted) rechaza un precioBob inyectado', async () => {
    const dto = plainToInstance(CrearProductoDto, { ...PRODUCTO_VALIDO, precioBob: 999 });
    const errores = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    expect(errores.some((e) => e.property === 'precioBob')).toBe(true);
  });

  it('el modelo Producto del schema.prisma no define ningún campo *Bob*', () => {
    const schema = fs.readFileSync(path.join(__dirname, '../../../prisma/schema.prisma'), 'utf-8');
    const bloqueProducto = schema.match(/model Producto \{[\s\S]*?\n\}/)?.[0] ?? '';

    expect(bloqueProducto).not.toMatch(/bob/i);
  });
});
