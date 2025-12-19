'use client'
import { useState, useMemo } from 'react'
import { Supply } from '@trailer/shared'
import { EditableStock } from './EditableStock'
import { SupplyModal } from './SupplyModal'
import { deleteSupply, confirmPriceValid } from './actions'
import { ResponsiveTable } from '@/components/ui/ResponsiveTable'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Toast, ToastType } from '@/components/ui/Toast'

type Props = {
    supplies: Supply[]
}

// Función para verificar si el precio está desactualizado (más de 30 días)
function isPriceOutdated(lastCheck?: string): boolean {
    if (!lastCheck) return true
    const daysSinceCheck = Math.floor((Date.now() - new Date(lastCheck).getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceCheck > 30
}

// Función para verificar si el insumo no tiene precio
function hasNoPrice(supply: Supply): boolean {
    return !supply.cost_per_unit || supply.cost_per_unit === 0
}

export function SuppliesClient({ supplies }: Props) {
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
    }

    // Filtrar supplies basado en el término de búsqueda
    const filteredSupplies = useMemo(() => {
        if (!searchTerm.trim()) return supplies

        const term = searchTerm.toLowerCase()
        return supplies.filter(supply =>
            supply.name.toLowerCase().includes(term) ||
            supply.provider?.toLowerCase().includes(term) ||
            supply.brand?.toLowerCase().includes(term) ||
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
        const confirmed = window.confirm('¿Estás seguro de borrar este insumo?\nSi está en uso en alguna receta, no se podrá eliminar.')
        if (!confirmed) return

        const res = await deleteSupply(id)
        if (res?.error) {
            showToast('❌ Error: ' + res.error, 'error')
        } else {
            showToast('Insumo eliminado correctamente', 'success')
        }
    }

    const handleConfirmPrice = async (id: string, name: string) => {
        const confirmed = window.confirm(`¿Confirmar que el precio de "${name}" sigue vigente?`)
        if (!confirmed) return

        const res = await confirmPriceValid(id)
        if (res?.error) {
            showToast('❌ Error: ' + res.error, 'error')
        } else {
            showToast('Precio confirmado como vigente', 'success')
        }
    }

    const columns = [
        {
            header: 'Insumo',
            cell: (item: Supply) => (
                <div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold text-[var(--color-secondary)]">{item.name}</div>
                        {hasNoPrice(item) && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-error)] text-white rounded-full uppercase tracking-wide animate-pulse">
                                Sin Precio
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-[var(--color-secondary)]/60">
                        {item.brand && <span className="font-mono">{item.brand}</span>}
                        {item.category && <span className="ml-2 opacity-70">• {item.category}</span>}
                    </div>
                </div>
            )
        },
        {
            header: 'Costo',
            cell: (item: Supply) => (
                <div className="flex items-center gap-2">
                    <div>
                        <div className="text-sm text-[var(--color-secondary)] font-bold">
                            ${item.cost_per_unit.toFixed(2)} <span className="text-[var(--color-secondary)]/50 text-xs font-normal">/ {item.unit}</span>
                        </div>
                        {item.package_cost && item.quantity_per_package && (
                            <div className="text-xs text-[var(--color-secondary)]/50">
                                {item.purchase_unit && <span>{item.purchase_unit}: </span>}
                                ${item.package_cost} / {item.quantity_per_package} {item.unit}
                            </div>
                        )}
                    </div>
                    {isPriceOutdated(item.last_price_check) && (
                        <button
                            onClick={() => handleConfirmPrice(item.id, item.name)}
                            className="text-[var(--color-warning)] hover:text-[var(--color-primary)] transition-colors animate-pulse"
                            title="Precio sin verificar en 30+ días. Click para confirmar."
                        >
                            ⚠️
                        </button>
                    )}
                </div>
            )
        },
        {
            header: 'Stock',
            cell: (item: Supply) => <EditableStock supply={item} />
        },
        {
            header: 'Proveedor',
            accessorKey: 'provider' as keyof Supply,
            cell: (item: Supply) => <span className="text-sm text-[var(--color-secondary)]/60">{item.provider || '-'}</span>
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

    const renderMobileItem = (item: Supply) => (
        <div className="space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-[var(--color-secondary)]">{item.name}</h3>
                        {hasNoPrice(item) && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--color-error)] text-white rounded-full uppercase tracking-wide animate-pulse">
                                Sin Precio
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-[var(--color-secondary)]/60">
                        {item.brand && <span>{item.brand}</span>}
                        {item.category && <span className="ml-2">• {item.category}</span>}
                    </p>
                </div>
                <EditableStock supply={item} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <span className="text-[var(--color-secondary)]/50 block text-xs font-bold uppercase">Costo</span>
                    <div className="flex items-center gap-1">
                        <span className="font-medium text-[var(--color-secondary)]">${item.cost_per_unit.toFixed(2)} / {item.unit}</span>
                        {isPriceOutdated(item.last_price_check) && (
                            <button
                                onClick={() => handleConfirmPrice(item.id, item.name)}
                                className="text-[var(--color-warning)]"
                                title="Precio desactualizado"
                            >
                                ⚠️
                            </button>
                        )}
                    </div>
                </div>
                <div>
                    <span className="text-[var(--color-secondary)]/50 block text-xs font-bold uppercase">Proveedor</span>
                    <span className="font-medium text-[var(--color-secondary)]">{item.provider || '-'}</span>
                </div>
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

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
            <PageHeader
                title="Inventario de Insumos"
                description="Gestiona tus materias primas y costos."
            >
                <div className="flex gap-2">
                    <Button onClick={handleCreate} variant="primary">
                        Nuevo Insumo
                    </Button>
                </div>
            </PageHeader>

            {/* Barra de Búsqueda */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre, proveedor, marca o categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-4 border border-[#e5e0d4] rounded-xl shadow-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition-all bg-white text-[var(--color-secondary)] placeholder:text-[var(--color-secondary)]/30 font-medium"
                />
                {searchTerm && (
                    <p className="text-sm text-[var(--color-secondary)]/60 mt-2 px-1">
                        Mostrando {filteredSupplies.length} de {supplies.length} insumos
                    </p>
                )}
            </div>

            <ResponsiveTable
                data={filteredSupplies}
                columns={columns}
                renderMobileItem={renderMobileItem}
                keyExtractor={(item) => item.id}
                emptyMessage={searchTerm ? "No se encontraron insumos con ese criterio." : "No hay insumos registrados aún."}
            />

            {isModalOpen && (
                <SupplyModal
                    supply={editingItem}
                    onClose={() => setIsModalOpen(false)}
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