import { Body, Controller, Post } from '@nestjs/common';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  crear(@Body() dto: CrearVentaDto) {
    return this.ventasService.crearVenta(dto);
  }
}
