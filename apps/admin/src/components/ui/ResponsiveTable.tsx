import * as React from "react"
import { Card, CardContent } from "./Card"

interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => React.ReactNode
    className?: string
}

interface ResponsiveTableProps<T> {
    data: T[]
    columns: Column<T>[]
    renderMobileItem: (item: T) => React.ReactNode
    keyExtractor: (item: T) => string | number
    emptyMessage?: string
}

export function ResponsiveTable<T>({
    data,
    columns,
    renderMobileItem,
    keyExtractor,
    emptyMessage = "No hay datos disponibles."
}: ResponsiveTableProps<T>) {

    if (data.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                {emptyMessage}
            </div>
        )
    }

    return (
        <>
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-[#e5e0d4]">
                    <thead className="bg-[#f0ede6]">
                        <tr>
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-3 text-left text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#e5e0d4]">
                        {data.map((item) => (
                            <tr key={keyExtractor(item)} className="hover:bg-[#f6f1e7] transition-colors">
                                {columns.map((col, index) => (
                                    <td key={index} className={`px-6 py-4 whitespace-nowrap text-sm text-[var(--color-secondary)] ${col.className || ''}`}>
                                        {col.cell
                                            ? col.cell(item)
                                            : col.accessorKey
                                                ? String(item[col.accessorKey])
                                                : null
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {data.map((item) => (
                    <Card key={keyExtractor(item)} className="overflow-hidden">
                        <CardContent className="p-4">
                            {renderMobileItem(item)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    )
}
