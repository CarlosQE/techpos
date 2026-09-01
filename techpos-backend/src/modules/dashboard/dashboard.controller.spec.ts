import { DashboardController } from './dashboard.controller';
import type { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  it('GET /kpis delega al service', async () => {
    const dashboardService = { obtenerKpis: jest.fn().mockResolvedValue({ valorTotalInventarioUsd: 0 }) };
    const controller = new DashboardController(dashboardService as unknown as DashboardService);

    await expect(controller.obtenerKpis()).resolves.toEqual({ valorTotalInventarioUsd: 0 });
  });
});
