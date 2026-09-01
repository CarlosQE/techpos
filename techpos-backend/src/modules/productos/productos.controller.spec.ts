import { ProductosController } from './productos.controller';
import type { ProductosService } from './productos.service';

describe('ProductosController', () => {
  let productosService: jest.Mocked<ProductosService>;
  let controller: ProductosController;

  beforeEach(() => {
    productosService = {
      crear: jest.fn(),
      listar: jest.fn(),
      buscar: jest.fn(),
      obtener: jest.fn(),
      actualizar: jest.fn(),
      eliminar: jest.fn(),
    } as unknown as jest.Mocked<ProductosService>;
    controller = new ProductosController(productosService);
  });

  it('POST / delega la creación al service', async () => {
    const dto = { sku: 'GPU-1', nombre: 'GPU 1', categoria: 'GPU', costoUsd: 100, margenPorcentaje: 20, stock: 5 };
    productosService.crear.mockResolvedValue({ id: '1', ...dto } as never);

    await controller.crear(dto as never);
    expect(productosService.crear).toHaveBeenCalledWith(dto);
  });

  it('GET / delega el listado al service', async () => {
    await controller.listar();
    expect(productosService.listar).toHaveBeenCalled();
  });

  it('GET /buscar delega la búsqueda al service con query params', async () => {
    await controller.buscar('rtx', 'GPU');
    expect(productosService.buscar).toHaveBeenCalledWith('rtx', 'GPU');
  });

  it('GET /:id delega la búsqueda al service', async () => {
    await controller.obtener('uuid-1');
    expect(productosService.obtener).toHaveBeenCalledWith('uuid-1');
  });

  it('PATCH /:id delega la actualización al service', async () => {
    await controller.actualizar('uuid-1', { stock: 3 });
    expect(productosService.actualizar).toHaveBeenCalledWith('uuid-1', { stock: 3 });
  });

  it('DELETE /:id delega la eliminación al service', async () => {
    await controller.eliminar('uuid-1');
    expect(productosService.eliminar).toHaveBeenCalledWith('uuid-1');
  });
});
