import ExcelJS from 'exceljs'
import type { ColumnaReporte } from './tablaReporte'
import { datosParaExportar } from './tablaReporte'
import type { ReporteTabla } from '../../../types/reportTypes'

const AZUL = '176B87'
const VERDE_SUAVE = 'EEF7F5'
const GRIS = '64748B'

export async function descargarReporteExcel<F>(reporte: ReporteTabla<F>, columnas: ColumnaReporte<F>[]) {
  const datos = datosParaExportar(reporte.grupos, columnas)
  const libro = new ExcelJS.Workbook()
  libro.creator = 'Transportes GT'
  libro.created = new Date()

  const resumen = libro.addWorksheet('Resumen')
  resumen.columns = [{ width: 28 }, { width: 28 }]
  resumen.mergeCells('A1:B1')
  resumen.getCell('A1').value = 'TRANSPORTES GT · INFORME CORPORATIVO'
  resumen.getCell('A1').font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 14 }
  resumen.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
  resumen.getCell('A3').value = 'Reporte'
  resumen.getCell('B3').value = reporte.titulo
  resumen.getCell('A4').value = 'Periodo'
  resumen.getCell('B4').value = `${reporte.filtros.desde ?? 'Inicio'} - ${reporte.filtros.hasta ?? 'Hoy'}`
  resumen.getCell('A5').value = 'Generado'
  resumen.getCell('B5').value = reporte.generadoEn
  Object.entries(reporte.totales).forEach(([clave, valor], indice) => {
    resumen.getCell(`A${7 + indice}`).value = clave.replaceAll('_', ' ')
    resumen.getCell(`B${7 + indice}`).value = typeof valor === 'number' ? valor : Number(valor) || String(valor)
  })
  resumen.getColumn(1).eachCell((celda) => { celda.font = { bold: true, color: { argb: GRIS } } })

  const detalle = libro.addWorksheet('Detalle')
  detalle.views = [{ state: 'frozen', ySplit: 1 }]
  detalle.addRow(datos.columnas)
  const encabezado = detalle.getRow(1)
  encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AZUL } }
  encabezado.alignment = { vertical: 'middle' }
  encabezado.height = 24
  datos.filas.forEach((fila) => detalle.addRow(fila))
  detalle.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + Math.min(datos.columnas.length, 26))}1` }
  detalle.columns.forEach((columna) => {
    let maximo = 12
    columna.eachCell?.({ includeEmpty: false }, (celda) => { maximo = Math.max(maximo, String(celda.value ?? '').length + 2) })
    columna.width = Math.min(maximo, 42)
  })
  detalle.eachRow((fila, indice) => {
    if (indice > 1 && indice % 2 === 0) fila.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: VERDE_SUAVE } }
    fila.alignment = { vertical: 'middle', wrapText: true }
  })

  const buffer = await libro.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${reporte.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}.xlsx`
  enlace.click()
  URL.revokeObjectURL(url)
}
