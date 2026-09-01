import { IsNumber, IsPositive, Max } from 'class-validator';

export class AjustarTipoCambioDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  @Max(50) // límite defensivo: descarta typos groseros (p.ej. 965 en vez de 9.65)
  valorOficial: number;
}
