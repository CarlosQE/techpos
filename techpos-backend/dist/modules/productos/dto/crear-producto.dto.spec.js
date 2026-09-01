"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const crear_producto_dto_1 = require("./crear-producto.dto");
const PRODUCTO_VALIDO = {
    sku: '024',
    nombre: 'RTX 4070',
    categoria: 'GPU',
    costoUsd: 480,
    margenPorcentaje: 25,
    stock: 10,
};
async function validar(input) {
    return (0, class_validator_1.validate)((0, class_transformer_1.plainToInstance)(crear_producto_dto_1.CrearProductoDto, input));
}
describe('CrearProductoDto', () => {
    it('acepta un producto con todos los campos válidos', async () => {
        expect(await validar(PRODUCTO_VALIDO)).toHaveLength(0);
    });
    it('acepta un producto sin SKU (se autogenera en el servicio)', async () => {
        const { sku: _sku, ...sinSku } = PRODUCTO_VALIDO;
        expect(await validar(sinSku)).toHaveLength(0);
    });
    it('rechaza SKU vacío', async () => {
        const errores = await validar({ ...PRODUCTO_VALIDO, sku: '' });
        expect(errores[0].constraints).toHaveProperty('isNotEmpty');
    });
    it('rechaza SKU que no sea numérico de 3 dígitos', async () => {
        const errores = await validar({ ...PRODUCTO_VALIDO, sku: 'GPU-42' });
        expect(errores.some((e) => e.constraints?.matches)).toBe(true);
    });
    it('rechaza costoUsd negativo o cero', async () => {
        const errores = await validar({ ...PRODUCTO_VALIDO, costoUsd: 0 });
        expect(errores[0].constraints).toHaveProperty('isPositive');
    });
    it('rechaza margenPorcentaje negativo', async () => {
        const errores = await validar({ ...PRODUCTO_VALIDO, margenPorcentaje: -5 });
        expect(errores[0].constraints).toHaveProperty('min');
    });
    it('rechaza stock no entero o negativo', async () => {
        const errores = await validar({ ...PRODUCTO_VALIDO, stock: -1 });
        expect(errores[0].constraints).toHaveProperty('min');
    });
});
