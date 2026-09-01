"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const crear_venta_dto_1 = require("./dto/crear-venta.dto");
const ventas_service_1 = require("./ventas.service");
let VentasController = class VentasController {
    constructor(ventasService) {
        this.ventasService = ventasService;
    }
    crear(dto) {
        return this.ventasService.crearVenta(dto);
    }
};
exports.VentasController = VentasController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_venta_dto_1.CrearVentaDto]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "crear", null);
exports.VentasController = VentasController = __decorate([
    (0, common_1.Controller)('ventas'),
    __metadata("design:paramtypes", [ventas_service_1.VentasService])
], VentasController);
