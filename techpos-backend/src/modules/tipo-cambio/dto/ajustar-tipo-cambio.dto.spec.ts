import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AjustarTipoCambioDto } from './ajustar-tipo-cambio.dto';

async function validarInput(input: unknown) {
  const dto = plainToInstance(AjustarTipoCambioDto, input);
  return validate(dto);
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
