"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const crear_venta_dto_1 = require("./crear-venta.dto");
async function validar(input) {
    return (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(crear_venta_dto_1.CrearVentaDto, input));
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
