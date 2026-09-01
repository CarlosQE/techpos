"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarProductoDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const crear_producto_dto_1 = require("./crear-producto.dto");
class ActualizarProductoDto extends (0, mapped_types_1.PartialType)(crear_producto_dto_1.CrearProductoDto) {
}
exports.ActualizarProductoDto = ActualizarProductoDto;
