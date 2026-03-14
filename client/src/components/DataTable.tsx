import React from 'react';

interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({ data, columns, onRowClick, emptyMessage = 'No data found' }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border-dark rounded-xl p-8 text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-dark rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border-dark bg-surface-2">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-xs font-semibold text-muted-2 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-dark">
          {data.map((row) => (
            <tr 
              key={(row as any).id} 
              onClick={() => onRowClick && onRowClick(row)}
              className={`interactive-row ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-sm text-white font-medium">
                  {col.render ? col.render(row) : (row as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
