import type { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { ProductosApiService } from './productos-api.service';

describe('ProductosApiService', () => {
  let http: { get: jasmine.Spy; post: jasmine.Spy };
  let service: ProductosApiService;

  beforeEach(() => {
    http = {
      get: jasmine.createSpy('get').and.returnValue(of([])),
      post: jasmine.createSpy('post').and.returnValue(of({})),
    };
    service = new ProductosApiService(http as unknown as HttpClient);
  });

  it('listar() llama a GET /productos', () => {
    service.listar().subscribe();
    expect(http.get).toHaveBeenCalledWith('http://localhost:3000/productos');
  });

  it('buscar() arma los query params solo con lo provisto', () => {
    service.buscar('rtx', 'GPU').subscribe();
    expect(http.get).toHaveBeenCalledWith('http://localhost:3000/productos/buscar', {
      params: { q: 'rtx', categoria: 'GPU' },
    });
  });

  it('buscar() sin argumentos no manda params', () => {
    service.buscar().subscribe();
    expect(http.get).toHaveBeenCalledWith('http://localhost:3000/productos/buscar', { params: {} });
  });

  it('crear() llama a POST /productos con el payload', () => {
    const payload = { sku: 'GPU-1', nombre: 'GPU', categoria: 'GPU', costoUsd: 100, margenPorcentaje: 20, stock: 5 };
    service.crear(payload).subscribe();
    expect(http.post).toHaveBeenCalledWith('http://localhost:3000/productos', payload);
  });
});
