# TechPOS BCB Engine — Arquitectura por Historia de Usuario

## 1. Estructura de carpetas

```
techpos/
├── backend/                                  # NestJS
│   ├── prisma/
│   │   └── schema.prisma                     # HU-01 (setup inicial, se extiende en HU-05/11)
│   └── src/
│       ├── prisma/
│       │   └── prisma.service.ts             # HU-01 (setup)
│       ├── common/
│       │   └── pricing.util.ts               # HU-11 (fórmula compartida, congela precios en venta)
│       └── modules/
│           ├── tipo-cambio/                  # Módulo 1 — HU-01 a HU-04
│           │   ├── dto/ajustar-tipo-cambio.dto.ts
│           │   ├── bcb-scraper.service.ts
│           │   ├── tipo-cambio.service.ts
│           │   ├── tipo-cambio.controller.ts
│           │   └── tipo-cambio.module.ts
│           ├── productos/                    # Módulo 2 — HU-05, HU-06, HU-09
│           │   ├── dto/{crear,actualizar}-producto.dto.ts
│           │   ├── productos.service.ts
│           │   ├── productos.controller.ts
│           │   ├── productos.module.ts
│           │   └── rf-2.2-sin-precio-bob.spec.ts
│           ├── ventas/                       # Módulo 3 (backend) — HU-11
│           │   ├── dto/crear-venta.dto.ts
│           │   ├── ventas.service.ts
│           │   ├── ventas.controller.ts
│           │   └── ventas.module.ts
│           └── dashboard/                    # Módulo 4 — HU-13
│               ├── dashboard.service.ts
│               ├── dashboard.controller.ts
│               └── dashboard.module.ts
│
└── frontend/                                 # Angular 18 Standalone + Signals
    └── src/app/core/pricing/
        ├── ng-signal-shim.ts                 # reemplazar por @angular/core real al integrar
        ├── pricing.utils.ts                  # HU-07
        ├── catalogo-pricing.service.ts       # HU-08
        ├── carrito.service.ts                # HU-10 (Módulo 3, frontend)
        └── ticket.utils.ts                   # HU-12 (Módulo 3, frontend)
```

Cada archivo `*.ts` tiene su `*.spec.ts` junto a él — van en el mismo commit.

## 2. Mapa HU → archivos → commit

| HU | RF | Archivos (crear/tocar) | Depende de |
|----|-----|------------------------|------------|
| HU-01 | 1.1 | `prisma/schema.prisma`, `prisma.service.ts`, `tipo-cambio/{bcb-scraper.service,tipo-cambio.service,tipo-cambio.module}.ts` | — (primer commit del repo) |
| HU-02 | 1.2 | `tipo-cambio/bcb-scraper.service.ts` (edita `obtenerVigenteConFallback`) | HU-01 |
| HU-03 | 1.3 | `tipo-cambio/tipo-cambio.controller.ts`, edita `tipo-cambio.module.ts` | HU-02 |
| HU-04 | 1.4 | `tipo-cambio/dto/ajustar-tipo-cambio.dto.ts`, edita `tipo-cambio.service.ts` y `.controller.ts` | HU-03 |
| HU-05 | 2.1 | `productos/{dto,productos.service,productos.controller,productos.module}.ts` | HU-01 (schema) |
| HU-06 | 2.2 | `productos/rf-2.2-sin-precio-bob.spec.ts` | HU-05 |
| HU-07 | 2.3 | `frontend/.../pricing.utils.ts` | — |
| HU-08 | 2.4 | `frontend/.../catalogo-pricing.service.ts` | HU-07 |
| HU-09 | 3.1 | edita `productos.service.ts` y `.controller.ts` (método `buscar`) | HU-05 |
| HU-10 | 3.2 | `frontend/.../carrito.service.ts` | HU-07 |
| HU-11 | 3.3 | `common/pricing.util.ts`, `ventas/{dto,ventas.service,ventas.controller,ventas.module}.ts` | HU-01, HU-05 |
| HU-12 | 3.4 | `frontend/.../ticket.utils.ts` | HU-10 |
| HU-13 | 4.1 | `dashboard/{dashboard.service,dashboard.controller,dashboard.module}.ts` | HU-01, HU-05 |
| HU-14 | 1.3/1.4 | `frontend/.../shell/shell-layout.component.{ts,html,scss}`, `core/api/tipo-cambio-api.service.ts` | HU-08 |
| HU-15 | 2.1 | `frontend/.../catalogo/catalogo.component.{ts,html,scss}`, `core/api/productos-api.service.ts` | HU-08 |
| HU-16 | 3.1-3.4 | `frontend/.../pos/pos.component.{ts,html,scss}`, `core/api/ventas-api.service.ts` | HU-10, HU-12 |
| HU-17 | 4.1 | `frontend/.../dashboard/dashboard.component.{ts,html,scss}`, `core/api/dashboard-api.service.ts` | — |

## 3. Convención de commits

Un commit (o PR) por HU, formato [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(<módulo>): HU-XX <descripción corta> (RF-Y.Z)
```

Ejemplos ya usados en este proyecto:
- `feat(tipo-cambio): HU-01 scraping automático BCB (RF-1.1)`
- `feat(tipo-cambio): HU-02 fallback a última cotización válida (RF-1.2)`
- `feat(productos): HU-05 CRUD de producto (RF-2.1)`
- `feat(ventas): HU-11 transacción atómica de venta (RF-3.3)`

Si una HU solo agrega tests de una restricción (ej. HU-06), usar `test(...)` en vez de `feat(...)`.

## 4. Flujo Git sugerido

1. Rama por HU: `feature/HU-05-crud-producto`.
2. Commit con código + spec juntos (nunca el código sin su test).
3. PR contra `main`, mergear en orden de dependencia (columna "Depende de" de la tabla).
4. Squash-merge para que quede **un commit por HU en `main`** — así el historial es directamente la lista de HU resueltas.

## 5. División sugerida entre 3 integrantes (sin choque de archivos)

- **Integrante A — Motor de Divisas:** HU-01, HU-02, HU-03, HU-04 (`tipo-cambio/`)
- **Integrante B — Inventario/Catálogo + Dashboard:** HU-05, HU-06, HU-09, HU-13 (`productos/`, `dashboard/`)
- **Integrante C — Frontend Pricing/POS + Venta atómica:** HU-07, HU-08, HU-10, HU-12 (`frontend/`), HU-11 (`ventas/`, cruza con A y B solo en lectura)

B y C dependen de que A entregue HU-01 primero (schema + `TipoCambioService`) y de que B entregue HU-05 (modelo `Producto` ya poblable) antes de que C/B ataquen HU-11/HU-13.

## 6. Setup manual del frontend (una sola vez, no es una HU)

Estos 4 archivos van en la raíz del `src/app/` del workspace que generó `ng new` (reemplazan a los que trae por defecto):

- `app.routes.ts`, `app.config.ts`, `app.component.ts`
- `src/styles.scss` (importa `src/styles/theme.scss`)

Pasos adicionales que no están en ningún archivo de código:

1. En `index.html`, agregar dentro de `<head>`:
   ```html
   <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
   ```
   (sin esto, los `<mat-icon>` no muestran nada).
2. En `angular.json`, dentro de `projects.<nombre>.architect.build.options.styles`, apuntar a `src/styles.scss` (no `.css`).
3. Instalar Angular Material si no está: `ng add @angular/material` (elegir "Custom" para no pisar `theme.scss`).
4. Los specs de `catalogo-pricing.service`, `carrito.service` y `ticket.utils` usan Signals reales de `@angular/core` — correrlos con `ng test`, no con `npx jest` (ese sigue sirviendo para los servicios API y `pricing.utils`, que no dependen de Angular).
