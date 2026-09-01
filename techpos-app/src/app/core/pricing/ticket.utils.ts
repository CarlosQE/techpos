import type { ItemCarrito } from './carrito.service';

export interface LineaTicket {
  nombre: string;
  cantidad: number;
  precioUnitarioBob: number;
  subtotalBob: number;
}

export interface DetalleImpuestos {
  subtotalBob: number;
  ivaBob: number;
  itBob: number;
  totalConImpuestosBob: number;
}

export interface Ticket {
  fecha: Date;
  tipoCambioAplicado: number;
  lineas: LineaTicket[];
  totalUsd: number;
  subtotalBob: number;
  ivaBob: number;
  itBob: number;
  totalConImpuestosBob: number;
}

// RF-3.4 — Emisión de Ticket: arma el modelo de datos que el componente
// modal renderiza con estilos `@media print` a 80mm (la maquetación CSS del
// modal vive en el componente Angular, no aquí; esto es el modelo puro).
// Los importes con impuestos (IVA 13% + IT 3%) provienen del cierre que hizo
// el backend, para que el ticket refleje exactamente lo cobrado.
export function construirTicket(
  items: ItemCarrito[],
  tipoCambioAplicado: number,
  fecha = new Date(),
  impuestos?: DetalleImpuestos,
): Ticket {
  const lineas: LineaTicket[] = items.map((item) => ({
    nombre: item.producto.nombre,
    cantidad: item.cantidad,
    precioUnitarioBob: item.precioUnitarioBob,
    subtotalBob: item.subtotalBob,
  }));

  const subtotal = items.reduce((acc, item) => acc + item.subtotalBob, 0);

  const impuestosFinales: DetalleImpuestos = impuestos ?? {
    subtotalBob: subtotal,
    ivaBob: +(subtotal * 0.13).toFixed(2),
    itBob: +(subtotal * 0.03).toFixed(2),
    totalConImpuestosBob: +(subtotal * 1.16).toFixed(2),
  };

  return {
    fecha,
    tipoCambioAplicado,
    lineas,
    totalUsd: items.reduce((acc, item) => acc + item.subtotalUsd, 0),
    subtotalBob: impuestosFinales.subtotalBob,
    ivaBob: impuestosFinales.ivaBob,
    itBob: impuestosFinales.itBob,
    totalConImpuestosBob: impuestosFinales.totalConImpuestosBob,
  };
}
