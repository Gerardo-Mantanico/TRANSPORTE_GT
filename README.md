# TRANSPORTE_GT

Sistema de gestión de transporte que conecta pasajeros, equipos y decisiones. Este repositorio contiene el **frontend** de la plataforma.

## Estructura del repositorio

```
frontend/
├── README.md              ← este archivo (índice del repo)
└── TRASPORTE_GT/          ← aplicación React
    ├── README.md          ← manual de uso y configuración
    ├── src/               ← código fuente
    ├── package.json       ← dependencias y scripts
    └── vite.config.ts     ← configuración de Vite
```

## Empezar

```bash
cd TRASPORTE_GT
npm install
npm run dev
```

Visita [http://localhost:5173](http://localhost:5173).

Para instrucciones completas (requisitos, roles, estructura del proyecto y cómo conectar el backend), consulta [`TRASPORTE_GT/README.md`](TRASPORTE_GT/README.md).

## Scripts disponibles

| Comando           | Descripción                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Servidor de desarrollo (puerto 5173) |
| `npm run build`   | Compilar para producción             |
| `npm run preview` | Previsualizar el build de producción |
| `npm run lint`    | Verificar el código con ESLint       |

## Estado

Prototipo de interfaz (vista) con datos de prueba en `src/data/mock.ts`. Aún no hay conexión con backend.
