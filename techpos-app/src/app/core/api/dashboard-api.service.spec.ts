import type { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';

describe('DashboardApiService', () => {
  it('obtenerKpis() llama a GET /dashboard/kpis', () => {
    const http = { get: jasmine.createSpy('get').and.returnValue(of({})) };
    const service = new DashboardApiService(http as unknown as HttpClient);

    service.obtenerKpis().subscribe();

    expect(http.get).toHaveBeenCalledWith('http://localhost:3000/dashboard/kpis');
  });
});
