import type { ItemCarrito } from './carrito.service';

export interface LineaTicket {
  nombre: string;
  cantidad: number;
  precioUnitarioBob: number;
  subtotalBob: number;
}

export interface Ticket {
  fecha: Date;
  tipoCambioAplicado: number;
  lineas: LineaTicket[];
  totalUsd: number;
  totalBob: number;
}

// RF-3.4 — Emisión de Ticket: arma el modelo de datos que el componente
// modal renderiza con estilos `@media print` a 80mm (la maquetación CSS del
// modal vive en el componente Angular, no aquí; esto es el modelo puro).
export function construirTicket(items: ItemCarrito[], tipoCambioAplicado: number, fecha = new Date()): Ticket {
  const lineas: LineaTicket[] = items.map((item) => ({
    nombre: item.producto.nombre,
    cantidad: item.cantidad,
    precioUnitarioBob: item.precioUnitarioBob,
    subtotalBob: item.subtotalBob,
  }));

  return {
    fecha,
    tipoCambioAplicado,
    lineas,
    totalUsd: items.reduce((acc, item) => acc + item.subtotalUsd, 0),
    totalBob: items.reduce((acc, item) => acc + item.subtotalBob, 0),
  };
}
