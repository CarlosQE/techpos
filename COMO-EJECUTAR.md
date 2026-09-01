# Cómo ejecutar TechPOS BCB Engine

Dos proyectos independientes: `techpos-backend` (NestJS, puerto 3000) y
`techpos-app` (Angular 18 + Material, puerto 4200). Arrancar el backend primero.

## 1. Backend

```
cd techpos-backend
npm install
npm install @nestjs/platform-express
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Verificar en el navegador: `http://localhost:3000/dashboard/kpis` (debe responder JSON).

## 2. Frontend

```
cd techpos-app
npm install
npm start
```

Abre automáticamente en `http://localhost:4200`. Este proyecto **ya está verificado**:
compila (`ng build` y `ng build` de producción corrieron sin errores en este entorno)
y trae Angular Material + el tema azul/blanco ya integrado — no requiere pasos
manuales de `ng add` ni de copiar archivos.

## 3. Qué probar

1. Al abrir, el Shell sincroniza el tipo de cambio automáticamente (chip azul en la barra superior).
2. **Catálogo** → "Nuevo producto" para cargar algo (necesario para lo siguiente).
3. **Punto de venta** → buscar el producto, agregarlo al carrito, "Cobrar" → aparece el ticket.
4. **Dashboard** → KPIs con el inventario recién cargado.

## 4. Tests

- `techpos-backend`: `npm test` → 59/59.
- `techpos-app`: `npm test` corre con Karma+Chrome (necesita navegador; no lo pude
  verificar en mi entorno de trabajo, que no tiene uno instalado). Si Chrome no
  está disponible en la máquina, instalar Google Chrome o Chromium primero.

## Notas

- `techpos-app` reemplaza cualquier carpeta `techpos-frontend` que hayan recibido
  en mensajes anteriores — es la versión definitiva, ya compilada y corregida.
- El resto de la organización por Historia de Usuario sigue en `ARQUITECTURA-COMMITS.md`.
