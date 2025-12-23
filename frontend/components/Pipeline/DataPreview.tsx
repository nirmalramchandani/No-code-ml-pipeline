"use client";

interface DataPreviewProps {
  columns: string[];
  rows: any[];
  totalRows: number;
  totalColumns: number;
}

export default function DataPreview({ columns, rows, totalRows, totalColumns }: DataPreviewProps) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 font-semibold whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr 
                key={idx} 
                className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={`${idx}-${col}`} className="px-6 py-3 whitespace-nowrap text-slate-700">
                     {row[col] !== null ? row[col] : <span className="text-slate-400 italic">null</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex justify-between text-xs text-slate-500 px-1">
          <span>Showing first {rows.length} rows</span>
          <span>{totalRows} rows, {totalColumns} columns total</span>
      </div>
    </div>
  );
}
