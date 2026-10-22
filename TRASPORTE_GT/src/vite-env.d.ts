/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del microservicio de Identidad (vía API Gateway). */
  readonly VITE_API_URL: string
  /** URL base del microservicio de Clientes y Cartera (vía API Gateway). */
  readonly VITE_CUSTOMERS_API_URL: string
  /** URL base del microservicio de Boletos (vía API Gateway). */
  readonly VITE_TICKETS_API_URL: string
  /** URL base del microservicio de Viajes (vía API Gateway). */
  readonly VITE_TRIPS_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
