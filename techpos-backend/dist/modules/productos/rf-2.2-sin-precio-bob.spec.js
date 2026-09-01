"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crear_producto_dto_1 = require("./dto/crear-producto.dto");
const PRODUCTO_VALIDO = {
    sku: 'GPU-RTX4070',
    nombre: 'RTX 4070',
    categoria: 'GPU',
    costoUsd: 480,
    margenPorcentaje: 25,
    stock: 10,
};
describe('RF-2.2 — Restricción estricta: nada de precios BOB persistidos', () => {
    it('el ValidationPipe (whitelist + forbidNonWhitelisted) rechaza un precioBob inyectado', async () => {
        const dto = (0, class_transformer_1.plainToInstance)(crear_producto_dto_1.CrearProductoDto, { ...PRODUCTO_VALIDO, precioBob: 999 });
        const errores = await (0, class_validator_1.validate)(dto, { whitelist: true, forbidNonWhitelisted: true });
        expect(errores.some((e) => e.property === 'precioBob')).toBe(true);
    });
    it('el modelo Producto del schema.prisma no define ningún campo *Bob*', () => {
        const schema = fs.readFileSync(path.join(__dirname, '../../../prisma/schema.prisma'), 'utf-8');
        const bloqueProducto = schema.match(/model Producto \{[\s\S]*?\n\}/)?.[0] ?? '';
        expect(bloqueProducto).not.toMatch(/bob/i);
    });
});
