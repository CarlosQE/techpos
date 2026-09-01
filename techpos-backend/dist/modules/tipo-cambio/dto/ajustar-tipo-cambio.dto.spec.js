"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ajustar_tipo_cambio_dto_1 = require("./ajustar-tipo-cambio.dto");
async function validarInput(input) {
    const dto = (0, class_transformer_1.plainToInstance)(ajustar_tipo_cambio_dto_1.AjustarTipoCambioDto, input);
    return (0, class_validator_1.validate)(dto);
}
describe('AjustarTipoCambioDto', () => {
    it('acepta un valor numérico positivo dentro de rango', async () => {
        const errores = await validarInput({ valorOficial: 9.65 });
        expect(errores).toHaveLength(0);
    });
    it('rechaza valores negativos o cero', async () => {
        const errores = await validarInput({ valorOficial: -1 });
        expect(errores[0].constraints).toHaveProperty('isPositive');
    });
    it('rechaza valores fuera de rango razonable (typos)', async () => {
        const errores = await validarInput({ valorOficial: 965 });
        expect(errores[0].constraints).toHaveProperty('max');
    });
    it('rechaza valores no numéricos', async () => {
        const errores = await validarInput({ valorOficial: 'once punto cinco' });
        expect(errores[0].constraints).toHaveProperty('isNumber');
    });
});
