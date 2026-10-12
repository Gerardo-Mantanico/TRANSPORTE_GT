import { useState, type ReactNode } from 'react'
import { cellText } from '../../utils/cellText'
import { Icon } from './Icon'

interface DataTableProps {
  headers: string[]
  rows: ReactNode[][]
}

export function DataTable({ headers, rows }: DataTableProps) {
  const filterableColumns = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => header.trim() && !/acciones/i.test(header))

  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({})
  const [mobileColumn, setMobileColumn] = useState(filterableColumns[0]?.index ?? 0)

  const setColumnFilter = (index: number, value: string) =>
    setColumnFilters((filters) => ({ ...filters, [index]: value }))

  const filteredRows = rows.filter((row) =>
    Object.entries(columnFilters).every(([index, value]) =>
      value.trim()
        ? cellText(row[Number(index)])
            .toLocaleLowerCase('es')
            .includes(value.toLocaleLowerCase('es'))
        : true,
    ),
  )

  const activeFilterCount = Object.values(columnFilters).filter(Boolean).length

  return (
    <div className="table-region">
      <div className="mobile-column-filter">
        <select
          value={mobileColumn}
          onChange={(event) => setMobileColumn(Number(event.target.value))}
        >
          {filterableColumns.map(({ header, index }) => (
            <option key={`${header}-${index}`} value={index}>
              Filtrar por {header}
            </option>
          ))}
        </select>
        <label>
          <Icon name="search" size={15} />
          <input
            value={columnFilters[mobileColumn] || ''}
            onChange={(event) => setColumnFilter(mobileColumn, event.target.value)}
            placeholder={`Buscar en ${headers[mobileColumn]?.toLowerCase()}...`}
          />
          {columnFilters[mobileColumn] && (
            <button onClick={() => setColumnFilter(mobileColumn, '')}>
              <Icon name="close" size={13} />
            </button>
          )}
        </label>
      </div>
      {activeFilterCount > 0 && (
        <div className="column-filter-status">
          <span>
            {filteredRows.length} resultado{filteredRows.length === 1 ? '' : 's'} con{' '}
            {activeFilterCount} filtro{activeFilterCount === 1 ? '' : 's'} de columna
          </span>
          <button onClick={() => setColumnFilters({})}>Limpiar filtros de columnas</button>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={`${header}-${index}`}>
                  <span className="column-title">
                    {header}
                    {columnFilters[index] && <i />}
                  </span>
                </th>
              ))}
            </tr>
            <tr className="column-filter-row">
              {headers.map((header, index) => (
                <th key={`filter-${header}-${index}`}>
                  {header.trim() && !/acciones/i.test(header) ? (
                    <label className="column-filter">
                      <Icon name="search" size={13} />
                      <input
                        value={columnFilters[index] || ''}
                        onChange={(event) => setColumnFilter(index, event.target.value)}
                        placeholder="Filtrar..."
                        aria-label={`Filtrar por ${header}`}
                      />
                      {columnFilters[index] && (
                        <button
                          onClick={() => setColumnFilter(index, '')}
                          aria-label={`Limpiar filtro ${header}`}
                        >
                          <Icon name="close" size={11} />
                        </button>
                      )}
                    </label>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} data-label={headers[cellIndex]}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr className="no-table-results">
                <td colSpan={headers.length}>
                  <div>
                    <Icon name="search" />
                    <strong>Sin coincidencias</strong>
                    <span>Cambie o limpie los filtros de las columnas.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
