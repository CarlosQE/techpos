"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ventas_controller_1 = require("./ventas.controller");
describe('VentasController', () => {
    it('POST / delega la creación de venta al service', async () => {
        const ventasService = { crearVenta: jest.fn().mockResolvedValue({ id: 'venta-1' }) };
        const controller = new ventas_controller_1.VentasController(ventasService);
        const dto = { items: [{ productoId: 'prod-1', cantidad: 1 }] };
        await expect(controller.crear(dto)).resolves.toEqual({ id: 'venta-1' });
        expect(ventasService.crearVenta).toHaveBeenCalledWith(dto);
    });
});
