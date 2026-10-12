import type { ReactNode } from 'react'
import { EXPENSE_LINES, TODAY } from '../../data/mock'
import { Badge } from '../../components/ui/Badge'
import { DataTable } from '../../components/ui/DataTable'
import { Field } from '../../components/ui/Field'
import { Icon } from '../../components/ui/Icon'
import { ImmutableCheck, InfoNote } from '../../components/ui/Misc'
import { SelectField } from '../../components/ui/SelectField'

export interface FlowDefinition {
  eyebrow: string
  title: string
  body: ReactNode
  action: string
  secondary?: string
  danger?: boolean
  dangerAction?: boolean
}

function renderDetailGrid(items: [string, string][]) {
  return (
    <div className="detail-grid">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function renderDetailStack(children: ReactNode) {
  return <div className="detail-stack">{children}</div>
}

function renderImmutableRecord(title: string, note: string) {
  return (
    <div className="immutable-record">
      <Icon name="check" />
      <div>
        <strong>{title}</strong>
        <p>{note}</p>
      </div>
    </div>
  )
}

function renderEmptyInline(title: string, note: string) {
  return (
    <div className="empty-inline">
      <Icon name="clock" />
      <div>
        <strong>{title}</strong>
        <p>{note}</p>
      </div>
    </div>
  )
}

function renderDangerCopy(
  icon: 'close' | 'bus' | 'route' | 'wrench' | 'users',
  children: ReactNode,
  footer?: string,
) {
  return (
    <div className="danger-copy">
      <span>
        <Icon name={icon} size={22} />
      </span>
      <p>{children}</p>
      {footer && <div>{footer}</div>}
    </div>
  )
}

const IMMUTABLE_LABEL = 'Esta información no podrá modificarse ni eliminarse.'

export const FLOW_DEFINITIONS: Record<string, FlowDefinition> = {
  'VJ-03': {
    eyebrow: 'VJ-03 · Detalle de viaje',
    title: 'Guatemala → Antigua',
    body: renderDetailStack(
      <>
        <div className="detail-hero">
          <div>
            <Badge tone="info">En tránsito</Badge>
            <h3>Viaje regular · {TODAY}</h3>
            <p>P-482KLM · Carlos Méndez</p>
          </div>
          <span>
            07:30 <Icon name="arrow" /> 08:45
          </span>
        </div>
        {renderDetailGrid([
          ['Kilometraje de salida', '128,450 km'],
          ['Boletos vendidos', '33 / 45'],
          ['Precio por boleto', 'Q 125.00'],
          ['Ingreso estimado', 'Q 4,125.00'],
        ])}
        {renderImmutableRecord(
          'Salida registrada · Registro inmutable',
          'Hora real: 07:34 · Kilometraje: 128,450 km',
        )}
        {renderEmptyInline(
          'Aún no se registra la llegada',
          'Complete el cierre cuando el bus llegue a su destino.',
        )}
      </>,
    ),
    action: 'Registrar llegada',
    secondary: 'Cerrar',
  },
  'VJ-04': {
    eyebrow: 'VJ-04 · Registro inmutable',
    title: 'Registrar salida',
    body: (
      <>
        <div className="read-only-row">
          <span>Bus</span>
          <strong>P-482KLM</strong>
          <span>Chofer</span>
          <strong>Carlos Méndez</strong>
        </div>
        <div className="form-grid two">
          <Field label="Hora real de salida" type="datetime-local" defaultValue={`${TODAY}T07:30`} required />
          <Field label="Kilometraje actual" type="number" defaultValue={128450} required />
        </div>
        <ImmutableCheck label={IMMUTABLE_LABEL} />
      </>
    ),
    action: 'Guardar salida',
    secondary: 'Cancelar',
  },
  'VJ-05': {
    eyebrow: 'VJ-05 · Registro inmutable',
    title: 'Registrar llegada',
    body: (
      <>
        <div className="form-grid two">
          <Field label="Hora real de llegada" type="datetime-local" defaultValue={`${TODAY}T09:02`} required />
          <Field label="Kilometraje final" type="number" defaultValue={128494} required />
          <Field label="Gasto total en combustible" defaultValue="Q 685.00" required />
          <Field label="Kilómetros recorridos" defaultValue="44 km" />
        </div>
        <div className="calculation">
          <span>Depreciación generada</span>
          <strong>44 km × Q 0.75 = Q 33.00</strong>
        </div>
        <ImmutableCheck label={IMMUTABLE_LABEL} />
      </>
    ),
    action: 'Guardar llegada',
    secondary: 'Cancelar',
  },
  'VJ-06': {
    eyebrow: 'VJ-06 · Acción destructiva',
    title: 'Eliminar viaje',
    danger: true,
    dangerAction: true,
    body: renderDangerCopy(
      'close',
      <>
        Se eliminará el viaje <strong>Guatemala → Antigua · {TODAY}</strong> y toda su información
        relacionada: <strong>boletos vendidos, asientos ocupados y reservaciones</strong>, mediante
        propagación de eventos a los demás microservicios.
      </>,
      'Esta acción no se puede deshacer.',
    ),
    action: 'Eliminar viaje',
    secondary: 'Cancelar',
  },
  'VJ-06-G': {
    eyebrow: 'VJ-06 · Guard de negocio',
    title: 'No se puede eliminar',
    danger: true,
    body: renderDangerCopy(
      'close',
      <>
        Solo puede eliminarse un viaje si <strong>no ha sido iniciado ni completado</strong>. Este
        viaje ya registra salida o llegó a destino, por lo que sus datos son inmutables.
      </>,
    ),
    action: 'Entendido',
  },
  'GEN-DEACT': {
    eyebrow: 'Acción · Desactivar',
    title: 'Desactivar registro',
    body: (
      <>
        <p className="modal-paragraph">
          El registro se desactivará y dejará de estar disponible para nuevas operaciones. Podrá
          reactivarlo en cualquier momento desde la lista.
        </p>
        <InfoNote>Los datos históricos y reportes existentes se conservarán.</InfoNote>
      </>
    ),
    action: 'Desactivar',
    secondary: 'Cancelar',
  },
  'GEN-EDIT': {
    eyebrow: 'Editar registro',
    title: 'Modificar información',
    body: (
      <>
        <p className="modal-paragraph">
          Seleccione los campos que desea actualizar. Los cambios quedarán registrados en el
          historial de la plataforma.
        </p>
      </>
    ),
    action: 'Continuar',
    secondary: 'Cancelar',
  },
  G2: {
    eyebrow: 'G2 · Guard de negocio',
    title: 'No se puede desactivar',
    danger: true,
    body: renderDangerCopy(
      'bus',
      <>
        El bus <strong>P-482KLM</strong> no puede desactivarse: tiene viajes programados o en
        tránsito.
      </>,
      '2 viajes deben completarse o cancelarse antes de continuar.',
    ),
    action: 'Entendido',
  },
  G3: {
    eyebrow: 'G3 · Guard de negocio',
    title: 'No se puede eliminar',
    danger: true,
    body: renderDangerCopy(
      'route',
      <>
        La ruta <strong>Guatemala → Antigua</strong> tiene viajes asociados. Elimine o cancele
        primero sus viajes.
      </>,
    ),
    action: 'Entendido',
  },
  'FS-03': {
    eyebrow: 'FS-03 · Detalle de bus',
    title: 'P-482KLM',
    body: renderDetailStack(
      <>
        <div className="bus-detail-head">
          <span>
            <Icon name="bus" size={36} />
          </span>
          <div>
            <h3>Mercedes-Benz Marcopolo</h3>
            <p>Modelo 2022 · 45 pasajeros</p>
          </div>
          <Badge tone="success">Operativo</Badge>
        </div>
        {renderDetailGrid([
          ['Kilometraje actual', '128,450 km'],
          ['Sucursal', 'Guatemala Centro'],
          ['Viajes realizados', '284'],
          ['Viajes activos', '2'],
        ])}
        <div className="person-card">
          <span className="avatar">CM</span>
          <div>
            <small>Chofer asignado actualmente</small>
            <strong>Carlos Méndez</strong>
            <p>Licencia A-028491 · Vigente</p>
          </div>
        </div>
      </>,
    ),
    action: 'Editar bus',
    secondary: 'Cerrar',
  },
  'FS-05-N': {
    eyebrow: 'FS-05 · Automatización',
    title: 'Avisos de vencimiento',
    body: (
      <>
        <div className="license-timeline">
          {['30 días antes', '15 días antes', '3 días antes'].map((label) => (
            <div key={label}>
              <span>
                <Icon name="check" />
              </span>
              <strong>{label}</strong>
              <small>Correo al chofer y al administrador</small>
            </div>
          ))}
        </div>
        <InfoNote>
          En alquileres privados se aplica un 15% adicional sobre el salario base del chofer.
        </InfoNote>
      </>
    ),
    action: 'Entendido',
  },
  'AL-03': {
    eyebrow: 'AL-03 · Cotización',
    title: 'Confirmar o modificar precio',
    body: (
      <>
        <div className="request-summary">
          <span>Inversiones Maya</span>
          <strong>Guatemala → Monterrico</strong>
          <small>20–22 de junio · 32 pasajeros</small>
        </div>
        <Field label="Precio confirmado" defaultValue="Q 4,850.00" required />
        <Field label="Nota de ajuste" placeholder="Motivo de la modificación (opcional)" />
      </>
    ),
    action: 'Confirmar precio',
    secondary: 'Rechazar solicitud',
  },
  'AL-04': {
    eyebrow: 'AL-04 · Asignación',
    title: 'Asignar bus y chofer',
    body: (
      <>
        <div className="form-grid two">
          <SelectField
            label="Bus"
            options={['P-541QTR · 46 pasajeros', 'P-728DBN · 50 pasajeros']}
            required
          />
          <SelectField
            label="Chofer"
            options={['Andrea Reyes · Licencia vigente', 'Luis Ramírez · Licencia vigente']}
            required
          />
        </div>
        <InfoNote>
          El chofer recibirá un <strong>15% adicional</strong> sobre su salario base por este viaje
          privado.
        </InfoNote>
      </>
    ),
    action: 'Asignar',
    secondary: 'Cancelar',
  },
  'AL-05': {
    eyebrow: 'AL-05 · Cierre inmutable',
    title: 'Finalizar alquiler',
    body: (
      <>
        <div className="form-grid two">
          <Field label="Kilometraje final" type="number" defaultValue={129120} required />
          <Field label="Gasto en combustible" defaultValue="Q 1,240.00" required />
          <Field label="Fecha de finalización" type="date" defaultValue={TODAY} required />
          <Field label="Depreciación generada" defaultValue="Q 318.75" />
        </div>
        <ImmutableCheck label={IMMUTABLE_LABEL} />
      </>
    ),
    action: 'Finalizar alquiler',
    secondary: 'Cancelar',
  },
  'AL-06': {
    eyebrow: 'AL-06 · Pago',
    title: 'Pagar alquiler con cartera',
    body: (
      <>
        <div className="payment-balance">
          <div>
            <span>Saldo actual</span>
            <strong>Q 6,100.00</strong>
          </div>
          <Icon name="arrow" />
          <div>
            <span>Saldo restante</span>
            <strong>Q 1,250.00</strong>
          </div>
        </div>
        <Field label="Fecha de pago" type="date" defaultValue={TODAY} required />
        <div className="calculation">
          <span>Pago del alquiler</span>
          <strong>Q 4,850.00</strong>
        </div>
      </>
    ),
    action: 'Pagar con cartera',
    secondary: 'Cancelar',
  },
  'AL-07': {
    eyebrow: 'AL-07 · Detalle',
    title: 'Alquiler privado #1048',
    body: renderDetailStack(
      <>
        <div className="detail-hero">
          <div>
            <Badge tone="success">Finalizado</Badge>
            <h3>Guatemala → Monterrico</h3>
            <p>Inversiones Maya · NIT 548921-2</p>
          </div>
          <strong>Q 4,850.00</strong>
        </div>
        {renderDetailGrid([
          ['Pasajeros', '32'],
          ['Bus', 'P-541QTR'],
          ['Chofer', 'Andrea Reyes'],
          ['Fechas', '20–22 jun'],
        ])}
        <div className="calculation">
          <span>Salario del chofer</span>
          <strong>Q 515.00 + 15% = Q 592.25</strong>
        </div>
        {renderImmutableRecord(
          'Cierre inmutable',
          '425 km · Combustible Q 1,240 · Depreciación Q 318.75',
        )}
      </>,
    ),
    action: 'Cerrar',
  },
  'TR-02-D': {
    eyebrow: 'TR-02 · Detalle de gasto',
    title: 'Servicio preventivo · P-482KLM',
    body: (
      <>
        <div className="read-only-row">
          <span>Fecha del servicio</span>
          <strong>14 jun 2025</strong>
          <span>Total</span>
          <strong>Q 2,480.00</strong>
        </div>
        <DataTable
          headers={['Categoría', 'Descripción', 'Tipo', 'Monto']}
          rows={EXPENSE_LINES.map((line) => [
            line[0],
            line[1],
            line[2],
            <strong>{line[3]}</strong>,
          ])}
        />
      </>
    ),
    action: 'Cerrar',
  },
  'TR-04': {
    eyebrow: 'TR-04 · Guard de negocio',
    title: 'No se puede eliminar esta categoría',
    danger: true,
    body: renderDangerCopy(
      'wrench',
      <>
        La categoría <strong>Motor</strong> tiene <strong>42 gastos asociados</strong>. Solo puede
        desactivarse: dejará de estar disponible para nuevos gastos, pero conservará su historial.
      </>,
    ),
    action: 'Desactivar categoría',
    secondary: 'Cerrar',
  },
  'AS-02-N': {
    eyebrow: 'AS-02 · Regla de sucursal',
    title: 'Desactivar sucursal',
    body: (
      <>
        <p className="modal-paragraph">
          La sucursal dejará de estar disponible para nuevas operaciones. Sus buses y choferes
          tampoco podrán asignarse a nuevos viajes.
        </p>
        <InfoNote>Los registros históricos y reportes existentes se conservarán.</InfoNote>
      </>
    ),
    action: 'Desactivar',
    secondary: 'Cancelar',
  },
  'AS-05': {
    eyebrow: 'AS-05 · Guard obligatorio',
    title: 'No se puede desactivar',
    danger: true,
    body: renderDangerCopy(
      'users',
      <>
        Siempre debe existir al menos un administrador de sistema activo. Cree otro administrador de
        sistema antes de desactivar este.
      </>,
    ),
    action: 'Entendido',
    secondary: 'Crear usuario',
  },
}

export const FLOW_LINKS_BY_PAGE: Record<string, { id: string; label: string; tone?: 'danger' }[]> = {
  viajes: [
    { id: 'VJ-03', label: 'Ver detalle de viaje' },
    { id: 'VJ-04', label: 'Registrar salida' },
    { id: 'VJ-05', label: 'Registrar llegada' },
    { id: 'VJ-06', label: 'Eliminar viaje', tone: 'danger' },
  ],
  buses: [
    { id: 'FS-03', label: 'Detalle del bus' },
    { id: 'G2', label: 'Probar guard de desactivación', tone: 'danger' },
  ],
  choferes: [{ id: 'FS-05-N', label: 'Avisos de licencia' }],
  rutas: [{ id: 'G3', label: 'Probar guard de eliminación', tone: 'danger' }],
  alquileres: [
    { id: 'AL-03', label: 'Confirmar precio' },
    { id: 'AL-04', label: 'Asignar bus y chofer' },
    { id: 'AL-05', label: 'Finalizar alquiler' },
    { id: 'AL-06', label: 'Pagar con cartera' },
    { id: 'AL-07', label: 'Ver detalle' },
  ],
  taller: [{ id: 'TR-02-D', label: 'Ver detalle del gasto' }],
  categorias: [{ id: 'TR-04', label: 'Probar categoría con gastos', tone: 'danger' }],
  sucursales: [{ id: 'AS-02-N', label: 'Reglas al desactivar' }],
  usuarios: [{ id: 'AS-05', label: 'Probar último administrador', tone: 'danger' }],
}
