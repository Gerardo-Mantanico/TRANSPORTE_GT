/* eslint-disable react-refresh/only-export-components */
import { pdf, Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ColumnaReporte } from './tablaReporte'
import { datosParaExportar } from './tablaReporte'
import type { ReporteTabla } from '../../../types/reportTypes'
import { formatFechaHora } from '../../../utils/format'

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', fontSize: 8, color: '#243746' },
  header: { borderBottom: '2 solid #176b87', paddingBottom: 14, marginBottom: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { color: '#fff', backgroundColor: '#176b87', borderRadius: 4, width: 26, height: 26, textAlign: 'center', paddingTop: 7, fontSize: 8, fontWeight: 700 },
  brand: { color: '#176b87', fontSize: 9, fontWeight: 700, letterSpacing: 1.2 },
  documentTag: { color: '#176b87', backgroundColor: '#eef7f5', borderRadius: 10, padding: '4 8', fontSize: 7, fontWeight: 700 },
  title: { fontSize: 18, fontWeight: 700, marginTop: 5 },
  subtitle: { color: '#64748b', fontSize: 9, marginTop: 4 },
  metadata: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metadataItem: { backgroundColor: '#f4f7f8', borderRadius: 4, padding: 7, flexGrow: 1 },
  metadataLabel: { color: '#64748b', fontSize: 7 },
  metadataValue: { color: '#243746', fontSize: 8, fontWeight: 700, marginTop: 3 },
  filters: { color: '#64748b', fontSize: 7, marginTop: 8 },
  summary: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryCard: { backgroundColor: '#eef7f5', border: '1 solid #cfe4ec', borderRadius: 5, padding: 8, flexGrow: 1 },
  summaryLabel: { color: '#64748b', fontSize: 7 },
  summaryValue: { color: '#176b87', fontSize: 10, fontWeight: 700, marginTop: 3 },
  table: { border: '1 solid #d7e2e5' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#176b87', color: '#fff', fontWeight: 700 },
  row: { flexDirection: 'row', borderTop: '1 solid #e7edef', minHeight: 22 },
  alternate: { backgroundColor: '#f7fafb' },
  cell: { flex: 1, padding: 5 },
  headerCell: { padding: 6, fontSize: 7 },
  footer: { position: 'absolute', bottom: 20, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', color: '#94a3b8', fontSize: 7 },
})

interface ReportePdfProps<F> {
  reporte: ReporteTabla<F>
  columnas: ColumnaReporte<F>[]
}

function ReportePdf<F>({ reporte, columnas }: ReportePdfProps<F>) {
  const datos = datosParaExportar(reporte.grupos, columnas)
  const filtros = Object.entries(reporte.filtros.otros).map(([clave, valor]) => `${clave}: ${valor}`).join(' · ')
  const filas = datos.filas

  return (
    <Document title={reporte.titulo} author="Transportes GT">
      <Page size="A4" orientation={datos.columnas.length > 6 ? 'landscape' : 'portrait'} style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandGroup}>
              <Text style={styles.logo}>TG</Text>
              <Text style={styles.brand}>TRANSPORTES GT</Text>
            </View>
            <Text style={styles.documentTag}>INFORME CORPORATIVO</Text>
          </View>
          <Text style={styles.title}>{reporte.titulo}</Text>
          <Text style={styles.subtitle}>Reporte operativo y financiero</Text>
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>PERIODO DEL REPORTE</Text>
              <Text style={styles.metadataValue}>{reporte.filtros.desde ?? 'Inicio'} - {reporte.filtros.hasta ?? 'Hoy'}</Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>GENERADO EL</Text>
              <Text style={styles.metadataValue}>{formatFechaHora(reporte.generadoEn)}</Text>
            </View>
          </View>
          {filtros && <Text style={styles.filters}>Filtros aplicados: {filtros}</Text>}
        </View>
        <View style={styles.summary}>
          {Object.entries(reporte.totales).slice(0, 4).map(([clave, valor]) => (
            <View style={styles.summaryCard} key={clave}>
              <Text style={styles.summaryLabel}>{clave.replaceAll('_', ' ')}</Text>
              <Text style={styles.summaryValue}>{String(valor)}</Text>
            </View>
          ))}
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            {datos.columnas.map((columna) => <Text style={[styles.cell, styles.headerCell]} key={columna}>{columna}</Text>)}
          </View>
          {filas.map((fila, indice) => (
            <View style={[styles.row, indice % 2 ? styles.alternate : {}]} key={`${indice}-${fila[0]}`} wrap={false}>
              {fila.map((valor, columna) => <Text style={styles.cell} key={`${indice}-${columna}`}>{valor || '—'}</Text>)}
            </View>
          ))}
        </View>
        <View style={styles.footer} fixed>
          <Text>Transportes GT · Documento generado automáticamente</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export async function descargarReportePdf<F>(reporte: ReporteTabla<F>, columnas: ColumnaReporte<F>[]) {
  const blob = await pdf(<ReportePdf reporte={reporte} columnas={columnas} />).toBlob()
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${reporte.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.pdf`
  enlace.click()
  URL.revokeObjectURL(url)
}
