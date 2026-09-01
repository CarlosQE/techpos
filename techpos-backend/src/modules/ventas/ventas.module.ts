import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  controllers: [VentasController],
  providers: [PrismaService, VentasService],
})
export class VentasModule {}
