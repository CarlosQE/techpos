import { Module } from '@nestjs/common';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProductosModule } from './modules/productos/productos.module';
import { TipoCambioModule } from './modules/tipo-cambio/tipo-cambio.module';
import { VentasModule } from './modules/ventas/ventas.module';

@Module({
  imports: [TipoCambioModule, ProductosModule, VentasModule, DashboardModule],
})
export class AppModule {}
