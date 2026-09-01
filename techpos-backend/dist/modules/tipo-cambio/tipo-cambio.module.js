"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoCambioModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcb_scraper_service_1 = require("./bcb-scraper.service");
const tipo_cambio_controller_1 = require("./tipo-cambio.controller");
const tipo_cambio_service_1 = require("./tipo-cambio.service");
let TipoCambioModule = class TipoCambioModule {
};
exports.TipoCambioModule = TipoCambioModule;
exports.TipoCambioModule = TipoCambioModule = __decorate([
    (0, common_1.Module)({
        // ScheduleModule.forRoot() solo debe registrarse una vez en AppModule;
        // se incluye aquí para que este módulo sea ejecutable de forma aislada.
        imports: [schedule_1.ScheduleModule.forRoot()],
        controllers: [tipo_cambio_controller_1.TipoCambioController],
        providers: [prisma_service_1.PrismaService, tipo_cambio_service_1.TipoCambioService, bcb_scraper_service_1.BcbScraperService],
        exports: [tipo_cambio_service_1.TipoCambioService],
    })
], TipoCambioModule);
