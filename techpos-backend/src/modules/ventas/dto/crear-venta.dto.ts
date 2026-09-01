import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsPositive, IsString, ValidateNested } from 'class-validator';

export class ItemVentaDto {
  @IsString()
  @IsNotEmpty()
  productoId: string;

  @IsPositive()
  cantidad: number;
}

export class CrearVentaDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ItemVentaDto)
  items: ItemVentaDto[];
}
