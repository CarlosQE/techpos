import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { BcbScraperService } from './bcb-scraper.service';
import { TipoCambioController } from './tipo-cambio.controller';
import { TipoCambioService } from './tipo-cambio.service';

@Module({
  // ScheduleModule.forRoot() solo debe registrarse una vez en AppModule;
  // se incluye aquí para que este módulo sea ejecutable de forma aislada.
  imports: [ScheduleModule.forRoot()],
  controllers: [TipoCambioController],
  providers: [PrismaService, TipoCambioService, BcbScraperService],
  exports: [TipoCambioService],
})
export class TipoCambioModule {}
