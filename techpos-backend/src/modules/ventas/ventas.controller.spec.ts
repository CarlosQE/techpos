import { VentasController } from './ventas.controller';
import type { VentasService } from './ventas.service';

describe('VentasController', () => {
  it('POST / delega la creación de venta al service', async () => {
    const ventasService = { crearVenta: jest.fn().mockResolvedValue({ id: 'venta-1' }) };
    const controller = new VentasController(ventasService as unknown as VentasService);
    const dto = { items: [{ productoId: 'prod-1', cantidad: 1 }] };

    await expect(controller.crear(dto)).resolves.toEqual({ id: 'venta-1' });
    expect(ventasService.crearVenta).toHaveBeenCalledWith(dto);
  });
});
