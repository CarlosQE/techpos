import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CrearProductoDto {
  @IsString()
  @IsNotEmpty()
  sku: string;

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
