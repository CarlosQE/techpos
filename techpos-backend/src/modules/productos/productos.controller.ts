import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  crear(@Body() dto: CrearProductoDto) {
    return this.productosService.crear(dto);
  }

  @Get()
  listar() {
    return this.productosService.listar();
  }

  // Debe declararse ANTES de ':id': Nest/Express matchea rutas literales por
  // orden de registro, y ':id' capturaría "buscar" como si fuera un id.
  @Get('buscar')
  buscar(@Query('q') q?: string, @Query('categoria') categoria?: string) {
    return this.productosService.buscar(q, categoria);
  }

  @Get(':id')
  obtener(@Param('id') id: string) {
    return this.productosService.obtener(id);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: ActualizarProductoDto) {
    return this.productosService.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  eliminar(@Param('id') id: string) {
    return this.productosService.eliminar(id);
  }
}
