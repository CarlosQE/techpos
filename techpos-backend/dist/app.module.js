"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const productos_module_1 = require("./modules/productos/productos.module");
const tipo_cambio_module_1 = require("./modules/tipo-cambio/tipo-cambio.module");
const ventas_module_1 = require("./modules/ventas/ventas.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [tipo_cambio_module_1.TipoCambioModule, productos_module_1.ProductosModule, ventas_module_1.VentasModule, dashboard_module_1.DashboardModule],
    })
], AppModule);
