import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Matches, Min } from 'class-validator';

export class CrearProductoDto {
  // Opcional: si se omite, el servicio genera un SKU automático de 3 dígitos.
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3}$/, { message: 'sku debe ser un código numérico de 3 dígitos' })
  sku?: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  costoUsd: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  margenPorcentaje: number;

  @IsInt()
  @Min(0)
  stock: number;
}
