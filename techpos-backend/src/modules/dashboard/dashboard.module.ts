import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TipoCambioModule } from '../tipo-cambio/tipo-cambio.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TipoCambioModule], // reutiliza TipoCambioService (findUltimo) ya exportado
  controllers: [DashboardController],
  providers: [PrismaService, DashboardService],
})
export class DashboardModule {}
