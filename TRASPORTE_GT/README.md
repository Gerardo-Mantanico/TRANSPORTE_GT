# TRANSPORTE GT — Frontend

Prototipo de interfaz (maqueta) para la plataforma de la empresa de transporte
extraurbano **TRANSPORTE GT**. cubre los módulos del *Proyecto 2* de la
clase de Software Avanzado: flota, viajes y ventas, clientes y alquileres, y
finanzas / administración.

> **Importante:** por el momento el frontend es **solo a nivel de vista**. Todos
> los datos viven en `src/data/mock.ts` y **no hay conexión con el backend**. La
> lógica de negocio y la persistencia se agregarán cuando se integren los
> microservicios.

---

## 1. Requisitos

- Node.js 18 o superior
- npm 9 o superior

## 2. Cómo correr el proyecto

```bash
# 1. Entrar a la carpeta del frontend
cd frontend/TRASPORTE_GT

# 2. Instalar dependencias
npm install

# 3. Levantar el servidor de desarrollo (Vite)
npm run dev
```

El servidor arranca en `http://localhost:5173` (por defecto). Se abre en el
navegador y ya se puede navegar la aplicación.

### Otros comandos útiles

```bash
npm run build    # genera la versión de producción en dist/
npm run preview  # sirve localmente el build de producción
npm run lint     # revisa el código con ESLint
```

---

## 3. Cómo ingresar / probar los roles

En la pantalla de **Login** se puede iniciar sesión con cualquier correo y
contraseña (no hay validación real). El rol con el que se entra define el menú
y las pantallas disponibles:

| Rol | Pantallas principales |
| --- | --- |
| **Cliente** | Explorar viajes, Solicitar alquiler, Mi historial, Cartera digital |
| **Administrador de sucursal** | Resumen, Viajes, Venta de boletos, Alquileres, Buses, Choferes, Rutas, Taller, Categorías, Reportes |
| **Administrador del sistema** | Resumen, Sucursales, Usuarios, Configuración, Reportes globales |

Para cambiar de rol rápidamente al probar, el selector **"Vista"** que está en
la barra superior (esquina superior derecha) permite alternar entre los tres
roles sin volver a entrar. Además, en el login la pestaña **"Crear cuenta"**
registra directamente un usuario con rol **Cliente**.

---

## 4. Estructura del proyecto

```
TRASPORTE_GT/
├── src/
│   ├── app/                  # Rutas, navegación y proveedores (auth, tema)
│   │   ├── AppRoutes.tsx     # Definición de rutas de React Router
│   │   ├── navigation.ts     # Menú por rol
│   │   └── providers/        # AuthProvider y ThemeProvider
│   ├── components/
│   │   ├── layout/           # Shell de la app: Sidebar, Topbar
│   │   ├── ui/               # Componentes reutilizables (Button, DataTable, Field, Modal, ...)
│   │   └── domain/           # SeatMap, RouteMap, LeafletRouteMap
│   ├── features/             # Una carpeta por pantalla / módulo
│   │   ├── auth/             # LoginPage
│   │   ├── dashboard/        # DashboardPage
│   │   ├── lists/            # ResourceListPage (viajes, buses, choferes, rutas, ...)
│   │   ├── modals/           # AddRecordModal y flujos (salida, llegada, guards)
│   │   ├── sales/            # TicketSalesPage (venta presencial)
│   │   ├── client/           # ExploreTrips, RentalRequest, History, Wallet
│   │   ├── reports/          # ReportsPage (reportes por rol)
│   │   ├── profile/          # ProfilePage
│   │   └── settings/         # SettingsPage (configuración del sistema)
│   ├── data/mock.ts          # TODOS los datos de prueba (aquí va el backend después)
│   ├── types/                # Tipos compartidos
│   ├── utils/                # Helpers (formato, celdas, exportar PDF)
│   └── styles/app.css        # Estilos globales de la aplicación
└── package.json
```

---

## 5. Qué contiene cada módulo (vista)

- **Login / Registro:** inicio de sesión, recuperación de contraseña y alta de
  cliente con NIT, DPI, teléfono y dirección.
- **Dashboard (Resumen):** KPIs, gráfica de ingresos, próximos viajes y
  actividad reciente.
- **Buses, Choferes, Rutas:** listados con filtros, alta y edición con todos
  los campos del enunciado (foto, placa, marca, modelo, año, capacidad,
  kilometraje, licencia, vencimiento, teléfono, salario, sucursales, etc.).
- **Viajes:** programación, registro inmutable de salida y llegada, y
  eliminación con guards de negocio.
- **Venta de boletos:** asistente de 3 pasos con plano de asientos y venta
  presencial por NIT o cliente genérico.
- **Taller y repuestos:** gastos con encabezado y detalle de líneas dinámicas
  (categoría, tipo, descripción, monto) y catálogo de categorías administrable.
- **Clientes:** explorar viajes, selección de asientos con capacidad real,
  cartera digital con recarga, historial de boletos y alquileres, y solicitud
  de alquiler con pago desde la cartera.
- **Reportes:** los reportes del enunciado por rol (admin del sistema y admin de
  sucursal) con filtros de fecha, filtros por sucursal/bus/ruta y **exportación
  a PDF**. El mapa de rutas usa **Leaflet**.

---

## 6. Notas para la conexión con el backend

- Todo lo que se muestra viene de `src/data/mock.ts`. Para conectar el backend
  solo hay que sustituir esas constantes por llamadas a la API.
- Los formularios y botones ya están colocados; falta enlazarlos a los
  endpoints correspondientes.
- Los reportes calculan totales y subtotales en el cliente con los datos mock;
  al conectar el backend, ese cálculo se puede mover al servidor.
