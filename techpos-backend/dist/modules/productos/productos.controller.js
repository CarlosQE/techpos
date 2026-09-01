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
exports.ProductosController = void 0;
const common_1 = require("@nestjs/common");
const actualizar_producto_dto_1 = require("./dto/actualizar-producto.dto");
const crear_producto_dto_1 = require("./dto/crear-producto.dto");
const productos_service_1 = require("./productos.service");
let ProductosController = class ProductosController {
    constructor(productosService) {
        this.productosService = productosService;
    }
    crear(dto) {
        return this.productosService.crear(dto);
    }
    listar() {
        return this.productosService.listar();
    }
    // Debe declararse ANTES de ':id': Nest/Express matchea rutas literales por
    // orden de registro, y ':id' capturaría "buscar" como si fuera un id.
    buscar(q, categoria) {
        return this.productosService.buscar(q, categoria);
    }
    obtener(id) {
        return this.productosService.obtener(id);
    }
    actualizar(id, dto) {
        return this.productosService.actualizar(id, dto);
    }
    eliminar(id) {
        return this.productosService.eliminar(id);
    }
};
exports.ProductosController = ProductosController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [crear_producto_dto_1.CrearProductoDto]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "crear", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "listar", null);
__decorate([
    (0, common_1.Get)('buscar'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('categoria')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "buscar", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "obtener", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, actualizar_producto_dto_1.ActualizarProductoDto]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "actualizar", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductosController.prototype, "eliminar", null);
exports.ProductosController = ProductosController = __decorate([
    (0, common_1.Controller)('productos'),
    __metadata("design:paramtypes", [productos_service_1.ProductosService])
], ProductosController);
