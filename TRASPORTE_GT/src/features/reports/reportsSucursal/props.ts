export interface ReporteSucursalProps {
  titulo: string
  subtitulo: string
  /** Sucursal elegida por el ADMIN_SISTEMA; el ADMIN_SUCURSAL no la envía (sale de su token). */
  idSucursal?: string
  /** `false` mientras el ADMIN_SISTEMA no elige sucursal. */
  habilitado: boolean
}

export const SIN_SUCURSAL = 'Seleccione una sucursal'
