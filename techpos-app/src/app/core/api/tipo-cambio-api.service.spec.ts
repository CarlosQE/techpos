import type { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { TipoCambioApiService } from './tipo-cambio-api.service';

describe('TipoCambioApiService', () => {
  let http: { post: jasmine.Spy };
  let service: TipoCambioApiService;

  beforeEach(() => {
    http = { post: jasmine.createSpy('post').and.returnValue(of({})) };
    service = new TipoCambioApiService(http as unknown as HttpClient);
  });

  it('sincronizar() llama a POST /tipo-cambio/sincronizar sin body', () => {
    service.sincronizar().subscribe();
    expect(http.post).toHaveBeenCalledWith('http://localhost:3000/tipo-cambio/sincronizar', {});
  });

  it('ajustarManual() llama a POST /tipo-cambio/manual con el valor', () => {
    service.ajustarManual(12.1).subscribe();
    expect(http.post).toHaveBeenCalledWith('http://localhost:3000/tipo-cambio/manual', { valorOficial: 12.1 });
  });
});
