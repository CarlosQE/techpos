// SQLite no soporta `enum` en el schema de Prisma (ver schema.prisma).
// Este objeto+type reemplaza 1:1 al enum que generaba Prisma: se sigue
// usando como `OrigenCotizacion.BCB_AUTO` / `OrigenCotizacion.MANUAL`.
export const OrigenCotizacion = {
  BCB_AUTO: 'BCB_AUTO',
  MANUAL: 'MANUAL',
} as const;

export type OrigenCotizacion = (typeof OrigenCotizacion)[keyof typeof OrigenCotizacion];
