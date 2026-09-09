import React from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | ((row: T) => string | number);
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  loading = false,
  emptyMessage = 'No records in database',
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="border border-[#1F293D] rounded-lg bg-[#111827] p-8 text-center">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
        <div className="text-xs font-mono text-slate-400">QUERYING SYSTEM REGISTRY...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="border border-[#1F293D] rounded-lg bg-[#111827] p-8 text-center text-xs text-slate-400">
        <div className="font-mono text-slate-400 font-semibold mb-1">NO RECORDS FOUND</div>
        <p className="text-slate-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="border border-[#1F293D] rounded-lg bg-[#111827] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-200">
          <thead className="bg-[#161F30] border-b border-[#1F293D] text-[10px] font-mono uppercase tracking-wider text-slate-400">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-2.5 font-semibold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1F293D]/60">
            {data.map((row, rowIdx) => {
              const rowKey = typeof keyField === 'function' ? keyField(row) : (row[keyField] as any);
              return (
                <tr
                  key={rowKey || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-[#1C2638]' : 'hover:bg-[#161F30]/50'
                  }`}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 py-2.5 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as any)
                        : null}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
