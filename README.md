# NestJS Ecommerce — Challenge Sr Fullstack (Microservicios)

## Índice

1. [Descripción general](#descripción-general)
2. [URLs públicas](#urls-públicas)
3. [Problemas detectados en el diseño original](#problemas-detectados-en-el-diseño-original)
4. [Cambios aplicados](#cambios-aplicados)
5. [Eventos de dominio implementados](#eventos-de-dominio-implementados)
6. [Decisiones técnicas relevantes](#decisiones-técnicas-relevantes)
7. [Arquitectura del sistema](#arquitectura-del-sistema)
8. [Cómo levantar el proyecto](#cómo-levantar-el-proyecto)
9. [Endpoints disponibles](#endpoints-disponibles)
10. [Flujo de prueba end-to-end](#flujo-de-prueba-end-to-end)

---

## Descripción general

Sistema de e-commerce construido en NestJS + PostgreSQL, evolucionado desde un monolito hacia un modelo **event-driven**. El sistema gestiona catálogo de productos, inventario por variación y país, usuarios con roles y órdenes de compra.

**Stack:**

- Backend: NestJS + TypeORM + PostgreSQL
- Frontend: React + Vite
- Infraestructura: Docker (local), Render (producción)
- Eventos: `@nestjs/event-emitter` (EventEmitter2)

---

## URLs públicas

| Servicio      | URL                                                          |
| ------------- | ------------------------------------------------------------ |
| Frontend      | https://challenge-sr-fullstack-microservici-seven.vercel.app |
| Backend       | https://nestjs-ecommerce-api-deh5.onrender.com               |
| Base de datos | PostgreSQL gestionado en Render                              |

**Credenciales de prueba:**

| Email           | Password | Rol   |
| --------------- | -------- | ----- |
| admin@admin.com | 12345678 | Admin |

---

## Problemas detectados en el diseño original

### 1. Bug crítico: evento `product.created` emitía el ID incorrecto

El método `create()` en `ProductService` emitía `product.categoryId` en lugar de `product.id`, lo que hacía que el listener de inventario recibiera un ID incorrecto y no pudiera inicializar el stock.

```typescript
// ❌ Código original — bug
this.eventEmitter.emit(
  "product.created",
  new ProductCreatedEvent(product.categoryId)
);

// ✅ Corrección aplicada
this.eventEmitter.emit(
  "product.created",
  new ProductCreatedEvent(savedProduct.id)
);
```

### 2. `createProduct` no persistía el producto antes de emitir el evento

El método usaba `entityManager.create()` (instancia en memoria) sin llamar a `save()`, por lo tanto el producto nunca se guardaba en la DB y el evento se emitía con `id: undefined`.

```typescript
// ❌ Original — el producto nunca se persistía
const product = await this.entityManager.create(Product, { ... });

// ✅ Corrección — create + save
const product = this.entityManager.create(Product, { ... });
const savedProduct = await this.entityManager.save(Product, product);
```

### 3. `InventoryListener` sin lógica real

El listener original solo hacía `console.log` sin ningún efecto en la base de datos, dejando el sistema de inventario completamente sin funcionalidad.

```typescript
// ❌ Original — sin efecto real
@OnEvent('product.created')
handleProductCreatedEvent(event: ProductCreatedEvent) {
  console.log('Producto creado:', event.productId);
}
```

### 4. Módulos de `Order` e `Inventory` vacíos

Los directorios `src/api/order/` y `src/api/inventory/` existían en la estructura pero no tenían ningún archivo implementado — ni controller, ni service, ni module.

### 5. `getAllProducts` lanzaba error si no había productos

En lugar de devolver un array vacío, lanzaba `NotFoundException` cuando no había productos, rompiendo el frontend al cargar una DB vacía.

```typescript
// ❌ Original
if (!products || products.length === 0) {
  throw new NotFoundException(errorMessages.product.notFound);
}

// ✅ Corrección
return products; // devuelve array vacío si no hay productos
```

### 6. SSL no configurado para conexión externa a PostgreSQL

La configuración de TypeORM tenía `ssl: false` en entorno de desarrollo, impidiendo conectarse a instancias PostgreSQL externas como Render que requieren SSL obligatoriamente.

```typescript
// ❌ Original
ssl: isProd ? { rejectUnauthorized: false } : false,

// ✅ Corrección
ssl: { rejectUnauthorized: false },
```

### 7. `typeOrm.config.ts` usaba variables individuales en lugar de `DATABASE_URL`

La configuración leía `DATABASE_HOST`, `DATABASE_PORT`, etc. desde un archivo `.env` por path, lo que impedía el deploy en Render donde la conexión se provee como una sola `DATABASE_URL`.

```typescript
// ❌ Original — no funciona en producción
host: process.env.DATABASE_HOST,
port: parseInt(process.env.DATABASE_PORT, 10),

// ✅ Corrección
url: process.env.DATABASE_URL,
ssl: { rejectUnauthorized: false },
```

### 8. Puerto de PostgreSQL en conflicto con instalación local

El `docker-compose.yml` original usaba el puerto `5432` sin especificar `container_name` ni `POSTGRES_DB`, causando conflicto con instalaciones locales de PostgreSQL en Windows.

### 9. CORS configurado solo para `localhost`

`main.ts` tenía CORS configurado únicamente para `http://localhost:5173`, bloqueando cualquier cliente en producción.

### 10. `decreaseStock` fallaba silenciosamente ante stock insuficiente

El método usaba `Math.max(0, quantity - requested)` en lugar de lanzar una excepción, permitiendo procesar órdenes sin stock sin notificar el error correctamente.

---

## Cambios aplicados

| Archivo                              | Cambio                                                   | Justificación                        |
| ------------------------------------ | -------------------------------------------------------- | ------------------------------------ |
| `product.service.ts`                 | Fix bug `categoryId` → `productId` en evento             | El listener recibía ID incorrecto    |
| `product.service.ts`                 | Agregar `save()` después de `create()`                   | Sin save el producto no se persistía |
| `product.service.ts`                 | `getAllProducts` devuelve array vacío                    | Evitar error en DB vacía             |
| `inventory.service.ts`               | Crear desde cero con lógica real                         | Módulo vacío, sin funcionalidad      |
| `inventory.module.ts`                | Crear desde cero                                         | Módulo no existía                    |
| `order/`                             | Crear módulo completo (controller, service, dto, module) | Directorio vacío                     |
| `listeners/inventory.listener.ts`    | Reemplazar `console.log` por lógica real                 | Sin efecto en DB                     |
| `app.module.ts`                      | Registrar `InventoryModule` y `OrderModule`              | Módulos no registrados               |
| `api.module.ts`                      | Agregar `OrderModule`                                    | Rutas de orden no expuestas          |
| `database/typeorm/typeOrm.config.ts` | Usar `DATABASE_URL`                                      | Compatibilidad con Render            |
| `database/migration/datasource.ts`   | SSL siempre activo                                       | Fallo de conexión con Render         |
| `docker-compose.yml`                 | Puerto 5433, `container_name`, `POSTGRES_DB`             | Conflicto con PostgreSQL local       |
| `main.ts`                            | CORS para múltiples orígenes y `PORT` dinámico           | Deploy en producción                 |
| `inventory.service.ts`               | `decreaseStock` lanza excepción ante stock insuficiente  | Error silencioso                     |
| Frontend                             | Aplicación React completa                                | No existía                           |

---

## Eventos de dominio implementados

### Evento 1: `product.created`

**Cuándo se emite:** Al crear un producto exitosamente en `ProductService.createProduct()`.

**Por qué tiene sentido:** Cuando un merchant da de alta un producto en el catálogo, el sistema de inventario debe prepararse para recibir stock. Esta es una responsabilidad del dominio de inventario, no del catálogo — por eso se comunican mediante evento y no mediante llamada directa entre módulos.

**Flujo:**

```
POST /product/create
  → ProductService.createProduct()
  → entityManager.save(Product) → obtiene id real
  → eventEmitter.emit('product.created', { productId })
  → InventoryListener.handleProductCreated()
  → InventoryService.initializeInventory(productId)
  → INSERT product_variation (color: NA, size: NA)
  → INSERT inventory (quantity: 0, countryCode: EG)
```

**Efecto en DB:** Se crea automáticamente una `ProductVariation` por defecto y un registro en `Inventory` con stock 0, sin que `ProductModule` conozca la existencia de `InventoryModule`.

---

### Evento 2: `order.created`

**Cuándo se emite:** Al crear una orden exitosamente en `OrderService.createOrder()`, después de validar stock suficiente.

**Por qué tiene sentido:** Cuando un cliente realiza una compra, el inventario debe decrementarse. `OrderModule` no debe conocer la implementación de `InventoryModule` — solo declara que ocurrió un evento de negocio y el listener se encarga del efecto.

**Flujo:**

```
POST /order/create
  → OrderService.createOrder()
  → Validar stock suficiente para cada item
  → eventEmitter.emit('order.created', { orderId, products, userId })
  → InventoryListener.handleOrderCreated()
  → Para cada item: InventoryService.decreaseStock()
  → UPDATE inventory SET quantity = quantity - item.quantity
```

**Efecto en DB:** El stock de cada variación solicitada se decrementa en la tabla `inventory`. Si el stock es insuficiente, la orden se rechaza **antes** de emitir el evento, manteniendo consistencia.

---

### Desacoplamiento entre módulos

```
ProductModule ──emit──→ 'product.created' ──→ InventoryListener
OrderModule   ──emit──→ 'order.created'   ──→ InventoryListener
                                                     │
                                              InventoryService
                                                     │
                                           DB: inventory, product_variation
```

`ProductModule` y `OrderModule` nunca se importan entre sí. La comunicación es exclusivamente a través del bus de eventos, permitiendo escalar, reemplazar o deshabilitar cualquier módulo sin afectar a los demás.

---

## Decisiones técnicas relevantes

### EventEmitter2 vs Kafka/RabbitMQ

Se eligió mantener `EventEmitter2` (ya presente en el repo original) en lugar de introducir un message broker externo. Para el alcance del challenge, EventEmitter2 cumple con el requisito de desacoplamiento entre módulos sin agregar complejidad operacional. En un sistema productivo con múltiples instancias, se reemplazaría por RabbitMQ o Kafka para garantizar entrega de mensajes y procesamiento distribuido.

### Validación de stock antes de emitir el evento

La validación de stock suficiente ocurre **antes** de emitir `order.created`. Esto evita emitir eventos que no pueden procesarse, manteniendo consistencia entre el estado declarado de la orden y el inventario real.

### QueryBuilder para inserciones de inventario

Se usó `createQueryBuilder().insert()` en lugar de `entityManager.save()` para la creación de `ProductVariation`. TypeORM tiene comportamiento inconsistente al mapear FKs con `save()` en objetos planos — el QueryBuilder garantiza que las columnas se mapeen directamente sin interferencia de la lógica de relaciones.

### Inicialización de inventario con variación por defecto

Al crear un producto, se genera automáticamente una `ProductVariation` con `sizeCode: 'NA'` y `colorName: 'NA'`. Esto garantiza que todo producto tiene al menos un registro de inventario consultable, independientemente de si tiene variaciones reales de talle o color.

### Manejo de errores en listeners

Los listeners envuelven la lógica en try/catch para evitar que un fallo en el procesamiento del evento derrumbe el proceso principal. En producción se agregaría un sistema de reintentos o dead letter queue.

### Restructura a monorepo

El proyecto se reorganizó separando `backend/` y `frontend/` en una estructura monorepo, facilitando el deploy independiente de cada servicio y la gestión de dependencias por separado.

---

## Arquitectura del sistema

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)             │
│  Login │ Register │ ProductList │ CreateProduct      │
│  CreateOrder │ InventoryStatus │ GetProduct          │
│                    Vercel                            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│               Backend (NestJS)                       │
│                                                     │
│  /auth     → AuthModule                             │
│  /product  → ProductModule ──emit──┐                │
│  /order    → OrderModule   ──emit──┤                │
│  /user     → UserModule            │                │
│  /role     → RoleModule      EventEmitter2          │
│                                    │                │
│                            InventoryListener        │
│                                    │                │
│                            InventoryService         │
│                    Render Web Service               │
└──────────────────────┬──────────────────────────────┘
                       │ SSL
┌──────────────────────▼──────────────────────────────┐
│         PostgreSQL (Render Managed Database)         │
│  user │ role │ product │ product_variation           │
│  inventory │ category │ color │ size                 │
│  country │ currency                                  │
└─────────────────────────────────────────────────────┘
```

---

## Cómo levantar el proyecto

### Prerrequisitos

- Node.js 20.x
- Docker Desktop
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Orlando3486/challenge-sr-fullstack-microservicios.git
cd challenge-sr-fullstack-microservicios
```

### 2. Levantar la base de datos con Docker

```bash
cd backend
docker compose up -d
```

Verificar que esté corriendo:

```bash
docker ps
# Debe aparecer: postgres_db
```

> **Nota:** El `docker-compose.yml` usa el puerto `5433` para evitar conflictos con instalaciones locales de PostgreSQL en Windows.

### 3. Configurar variables de entorno del backend

Crear `src/common/envs/development.env`:

```dotenv
PORT=3000
BASE_URL=http://localhost:3000

DATABASE_HOST=localhost
DATABASE_NAME=ecommercedb
DATABASE_USER=hassan
DATABASE_PASSWORD=password
DATABASE_PORT=5433

JWT_SECRET=keep-this-secret-private
DATABASE_ENTITIES=dist/**/*.entity.js

ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=12345678
```

### 4. Instalar dependencias y correr migraciones

```bash
npm install
NODE_ENV=development npm run migration:run
```

### 5. Correr los seeders

```bash
npm run seed:run
```

Esto crea:

- Roles: Customer, Merchant, Admin
- Usuario admin: `admin@admin.com` / `12345678`
- Categorías: Computers, Fashion
- Colores, tallas, país (EG - Egypt) y moneda por defecto

### 6. Levantar el backend

```bash
npm run start:dev
```

Backend disponible en `http://localhost:3000`.

### 7. Configurar y levantar el frontend

```bash
cd "../frontend/Challenge Sr FullStack (microservicio)"
npm install
```

Crear `.env`:

```dotenv
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

Frontend disponible en `http://localhost:5173`.

---

## Endpoints disponibles

### Auth

| Método | Ruta             | Descripción       | Auth |
| ------ | ---------------- | ----------------- | ---- |
| POST   | `/auth/register` | Registrar usuario | No   |
| POST   | `/auth/login`    | Iniciar sesión    | No   |

### Product

| Método | Ruta                    | Descripción                              | Auth           |
| ------ | ----------------------- | ---------------------------------------- | -------------- |
| GET    | `/product/products`     | Listar todos los productos               | No             |
| GET    | `/product/:id`          | Obtener producto por ID                  | No             |
| POST   | `/product/create`       | Crear producto (emite `product.created`) | Admin/Merchant |
| POST   | `/product/:id/details`  | Agregar detalles al producto             | Admin/Merchant |
| POST   | `/product/:id/activate` | Activar producto                         | Admin/Merchant |
| DELETE | `/product/:id`          | Eliminar producto                        | Admin/Merchant |

### Order

| Método | Ruta                                         | Descripción                         | Auth           |
| ------ | -------------------------------------------- | ----------------------------------- | -------------- |
| POST   | `/order/create`                              | Crear orden (emite `order.created`) | Customer/Admin |
| GET    | `/order/inventory/:variationId/:countryCode` | Consultar stock por variación       | Admin/Merchant |
| GET    | `/order/inventory/product/:productId`        | Consultar stock por producto        | Admin/Merchant |

### User

| Método | Ruta            | Descripción                    | Auth          |
| ------ | --------------- | ------------------------------ | ------------- |
| GET    | `/user/profile` | Perfil del usuario autenticado | Cualquier rol |

### Role

| Método | Ruta           | Descripción           | Auth  |
| ------ | -------------- | --------------------- | ----- |
| POST   | `/role/assign` | Asignar rol a usuario | Admin |

---

## Flujo de prueba end-to-end

### En producción

1. Acceder a https://challenge-sr-fullstack-microservici-seven.vercel.app
2. Iniciar sesión con `admin@admin.com` / `12345678`
3. Crear un producto de categoría Computers — verificar que aparece en la lista automáticamente
4. Consultar stock del producto creado por ID — debería mostrar `quantity: 0`
5. Actualizar stock desde DBeaver conectado a Render con `UPDATE inventory SET quantity = 100`
6. Crear una orden con la variación del producto, país `EG` y cantidad deseada
7. Consultar stock nuevamente — cantidad reducida confirma el flujo event-driven completo

### Verificación de eventos

- **`product.created`**: Al crear un producto, se inicializa automáticamente un registro en `inventory` con stock 0 — sin llamada directa entre módulos
- **`order.created`**: Al crear una orden, el stock se descuenta automáticamente — `OrderModule` nunca importa ni llama a `InventoryModule` directamente
