# Challenge SR Fullstack - Microservicios

Este repositorio contiene la solución al challenge técnico de backend y frontend basado en un proyecto inicial público.

⚠️ El repositorio original no pertenece a la empresa y contiene errores de arquitectura, diseño e implementación que deben ser identificados y corregidos como parte del desafío.

## Estructura del proyecto

```
/backend   → API REST en NestJS + PostgreSQL (event-driven)
/frontend  → Aplicación React + Vite
```

## URLs públicas

| Servicio | URL                                                          |
| -------- | ------------------------------------------------------------ |
| Frontend | https://challenge-sr-fullstack-microservici-seven.vercel.app |
| Backend  | https://nestjs-ecommerce-api-deh5.onrender.com               |

## Documentación completa

Ver [backend/README.md] para:

- Problemas detectados en el diseño original
- Eventos de dominio implementados
- Decisiones técnicas
- Cómo levantar el proyecto localmente

## Stack

- **Backend:** NestJS + TypeORM + PostgreSQL + EventEmitter2
- **Frontend:** React + Vite
- **Infraestructura:** Docker (local), Render + Vercel (producción)
