import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CrearVentaDto } from './crear-venta.dto';

async function validar(input: unknown) {
  return validate(plainToInstance(CrearVentaDto, input));
}

describe('CrearVentaDto', () => {
  it('acepta una lista de items válida', async () => {
    const errores = await validar({ items: [{ productoId: 'uuid-1', cantidad: 2 }] });
    expect(errores).toHaveLength(0);
  });

  it('rechaza una lista vacía de items', async () => {
    const errores = await validar({ items: [] });
    expect(errores[0].constraints).toHaveProperty('arrayNotEmpty');
  });

  it('rechaza cantidad negativa o cero en un item', async () => {
    const errores = await validar({ items: [{ productoId: 'uuid-1', cantidad: 0 }] });
    const errorDelItem = errores[0].children?.[0];
    expect(errorDelItem?.children?.[0].constraints).toHaveProperty('isPositive');
  });
});
