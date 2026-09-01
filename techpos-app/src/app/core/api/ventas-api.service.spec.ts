import type { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { VentasApiService } from './ventas-api.service';

describe('VentasApiService', () => {
  it('crear() envuelve los items en { items } y postea a /ventas', () => {
    const http = { post: jasmine.createSpy('post').and.returnValue(of({})) };
    const service = new VentasApiService(http as unknown as HttpClient);

    service.crear([{ productoId: 'p1', cantidad: 2 }]).subscribe();

    expect(http.post).toHaveBeenCalledWith('http://localhost:3000/ventas', {
      items: [{ productoId: 'p1', cantidad: 2 }],
    });
  });
});
