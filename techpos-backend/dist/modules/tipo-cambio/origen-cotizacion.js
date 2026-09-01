"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrigenCotizacion = void 0;
// SQLite no soporta `enum` en el schema de Prisma (ver schema.prisma).
// Este objeto+type reemplaza 1:1 al enum que generaba Prisma: se sigue
// usando como `OrigenCotizacion.BCB_AUTO` / `OrigenCotizacion.MANUAL`.
exports.OrigenCotizacion = {
    BCB_AUTO: 'BCB_AUTO',
    MANUAL: 'MANUAL',
};
