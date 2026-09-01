"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_controller_1 = require("./dashboard.controller");
describe('DashboardController', () => {
    it('GET /kpis delega al service', async () => {
        const dashboardService = { obtenerKpis: jest.fn().mockResolvedValue({ valorTotalInventarioUsd: 0 }) };
        const controller = new dashboard_controller_1.DashboardController(dashboardService);
        await expect(controller.obtenerKpis()).resolves.toEqual({ valorTotalInventarioUsd: 0 });
    });
});
