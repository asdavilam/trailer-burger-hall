'use client'
import { useState, useMemo } from 'react'
import { Supply } from '@trailer/shared'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { ProductionModal } from './ProductionModal'
import { ResponsiveTable } from '@/components/ui/ResponsiveTable'
import { EditableStock } from '../../supplies/EditableStock'
import { deleteSupply } from '../../supplies/actions'
import { Toast, ToastType } from '@/components/ui/Toast'

type Props = {
    supplies: Supply[]
    bufferMultiplier: number
}

export function ProductionListClient({ supplies, bufferMultiplier }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<Supply | undefined>(undefined)
    const [searchTerm, setSearchTerm] = useState('')

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    })

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true })
        // Auto hide after 3 seconds
        setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 3000)
    }

    // Filtrar: Solo producción
    const productionSupplies = useMemo(() => {
        const list = supplies.filter(item => item.supply_type === 'production')

        if (!searchTerm.trim()) return list

        const term = searchTerm.toLowerCase()
        return list.filter(supply =>
            supply.name.toLowerCase().includes(term) ||
            supply.category?.toLowerCase().includes(term)
        )
    }, [supplies, searchTerm])


    const handleCreate = () => {
        setEditingItem(undefined)
        setIsModalOpen(true)
    }

    const handleEdit = (item: Supply) => {
        setEditingItem(item)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('¿Estás seguro de borrar esta receta?\nEsto no se puede deshacer.')
        if (!confirmed) return

        const res = await deleteSupply(id)
        if (res?.error) {
            showToast('❌ Error: ' + res.error, 'error')
        } else {
            showToast('Receta eliminada correctamente', 'success')
            // Opcional: recargar si el server action no lo hace suficiente (nextjs suele hacerlo)
        }
    }

    const columns = [
        {
            header: 'Receta',
            cell: (item: Supply) => (
                <div>
                    <div className="font-bold text-[var(--color-secondary)]">{item.name}</div>
                    <div className="text-xs text-[var(--color-secondary)]/60">
                        {item.category || 'General'}
                    </div>
                </div>
            )
        },
        {
            header: 'Rendimiento',
            cell: (item: Supply) => (
                <div className="text-sm">
                    <span className="font-medium">{item.yield_quantity} {item.unit}</span>
                </div>
            )
        },
        {
            header: 'Estado',
            cell: (item: Supply) => {
                const min = item.min_stock ?? 0
                const target = min * bufferMultiplier
                const missing = target - item.current_stock
                const isCritical = item.current_stock <= min

                if (missing > 0) {
                    return (
                        <div className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${isCritical ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'}`}>
                            Faltan {missing.toFixed(1)} {item.unit}
                        </div>
                    )
                }
                return (
                    <div className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700 inline-block">
                        OK
                    </div>
                )
            }
        },
        {
            header: 'Stock',
            cell: (item: Supply) => <EditableStock supply={item} />
        },
        {
            header: 'Costo P/U',
            cell: (item: Supply) => (
                <div className="text-sm font-bold text-[var(--color-secondary)]">
                    ${item.cost_per_unit.toFixed(2)}
                </div>
            )
        },
        {
            header: 'Acciones',
            className: 'text-right',
            cell: (item: Supply) => (
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        ✏️ Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-[var(--color-error)] hover:bg-[var(--color-error)]/10 hover:text-[var(--color-error)]">
                        🗑️ Borrar
                    </Button>
                </div>
            )
        }
    ]

    const renderMobileItem = (item: Supply) => {
        const min = item.min_stock ?? 0
        const target = min * bufferMultiplier
        const missing = target - item.current_stock

        return (
            <div className="space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-[var(--color-secondary)]">{item.name}</h3>
                        <p className="text-xs text-[var(--color-secondary)]/60">{item.category}</p>
                    </div>
                    {missing > 0 ? (
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                            Faltan {missing.toFixed(1)}
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Stock OK</span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-[var(--color-secondary)]/50 block text-xs font-bold uppercase">Rendimiento</span>
                        <span className="font-medium text-[var(--color-secondary)]">{item.yield_quantity} {item.unit}</span>
                    </div>
                    <div>
                        <span className="text-[var(--color-secondary)]/50 block text-xs font-bold uppercase">Costo</span>
                        <span className="font-medium text-[var(--color-secondary)]">${item.cost_per_unit.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[#e5e0d4] pt-2">
                    <span className="text-sm font-bold">Stock Actual:</span>
                    <EditableStock supply={item} />
                </div>

                <div className="flex gap-2 pt-2 border-t border-[#e5e0d4] mt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)} className="flex-1">
                        ✏️ Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} className="flex-1">
                        🗑️ Borrar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <PageHeader
                title="👩‍🍳 Lista de Producción"
                description={`Recetas gestionadas internamente.`}
            >
                <div className="flex gap-2">
                    <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
                        + Nueva Receta
                    </Button>
                </div>
            </PageHeader>

            {/* Barra de Búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Buscar receta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 border border-[#e5e0d4] rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-[var(--color-secondary)] placeholder:text-[var(--color-secondary)]/30 font-medium"
                />
            </div>

            <ResponsiveTable
                data={productionSupplies}
                columns={columns}
                renderMobileItem={renderMobileItem}
                keyExtractor={(item) => item.id}
                emptyMessage={searchTerm ? "No se encontraron recetas." : "No hay recetas registradas."}
            />

            {isModalOpen && (
                <ProductionModal
                    supply={editingItem}
                    onClose={() => {
                        setIsModalOpen(false)
                        window.location.reload()
                    }}
                />
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    )
}
