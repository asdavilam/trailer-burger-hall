'use client'

import { useState, useEffect } from 'react'
import { Supply, UserProfile } from '@trailer/shared'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getUsers } from '../team/user-actions'
import { updateBulkAssignment } from '../supplies/actions'

type Props = {
    supplies: Supply[]
}

export function AssignmentSettings({ supplies }: Props) {
    const [users, setUsers] = useState<Pick<UserProfile, 'id' | 'display_name' | 'role'>[]>([])
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [targetUserId, setTargetUserId] = useState<string>('')
    const [viewFilter, setViewFilter] = useState<string>('all') // 'all', 'unassigned', or specific user_id
    const [isSaving, setIsSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        getUsers().then(data => setUsers(data as any))
    }, [])

    // Filter supplies
    const filteredSupplies = supplies.filter(item => {
        // Exclude production items (they don't need purchase assignment usually, but maybe? let's filter purely purchasing for now unless requested otherwise. Actually user didn't specify. Assuming all supplies.)
        // Actually, let's keep all, but filter by view
        if (item.supply_type === 'production') return false // Hide production recipes from purchase assignment

        if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false

        if (viewFilter === 'all') return true
        if (viewFilter === 'unassigned') return !item.assigned_user_id
        return item.assigned_user_id === viewFilter
    })

    const handleToggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setSelectedIds(newSet)
    }

    const handleSelectAll = () => {
        if (selectedIds.size === filteredSupplies.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredSupplies.map(s => s.id)))
        }
    }

    const handleBulkAssign = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`¿Asignar ${selectedIds.size} insumos al usuario seleccionado?`)) return

        setIsSaving(true)
        // Convert empty string back to null for unassignment
        const finalUserId = targetUserId === '' ? null : targetUserId

        const res = await updateBulkAssignment(Array.from(selectedIds), finalUserId)

        setIsSaving(false)
        if (res?.error) {
            alert('Error: ' + res.error)
        } else {
            // Clear selection on success
            setSelectedIds(new Set())
            alert('Asignación actualizada correctamente')
        }
    }

    return (
        <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
                <CardTitle className="flex justify-between items-center text-orange-900">
                    <span>👥 Asignación Masiva de Compras</span>
                    <span className="text-xs font-normal bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                        {supplies.length} Insumos
                    </span>
                </CardTitle>
                <p className="text-sm text-gray-500">
                    Selecciona múltiples insumos y asigna quién es responsable de comprarlos.
                </p>
            </CardHeader>
            <CardContent>
                {/* TOOLBAR */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end md:items-center bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                    {/* Filters */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Filtrar por</label>
                            <select
                                value={viewFilter}
                                onChange={(e) => setViewFilter(e.target.value)}
                                className="p-2 border rounded text-sm bg-gray-50 min-w-[150px]"
                            >
                                <option value="all">Ver Todos</option>
                                <option value="unassigned">⚠️ Sin Asignar</option>
                                <optgroup label="Por Usuario">
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.display_name}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Buscar</label>
                            <input
                                type="text"
                                placeholder="Buscar insumo..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="p-2 border rounded text-sm w-full"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 items-end w-full md:w-auto">
                        <div className="flex-1 md:flex-none">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Asignar a:</label>
                            <select
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                className="w-full p-2 border rounded text-sm font-medium bg-orange-50 border-orange-200 text-orange-900"
                            >
                                <option value="">-- General / Sin Asignar --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.display_name} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                        <Button
                            onClick={handleBulkAssign}
                            disabled={selectedIds.size === 0 || isSaving}
                            className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap"
                        >
                            {isSaving ? 'Guardando...' : `Aplicar (${selectedIds.size})`}
                        </Button>
                    </div>
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-2 mb-2">
                    <div className="col-span-1 text-center">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === filteredSupplies.length && filteredSupplies.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4"
                        />
                    </div>
                    <div className="col-span-11 md:col-span-6">Insumo</div>
                    <div className="hidden md:block col-span-5">Responsable Actual</div>
                </div>

                {/* LIST */}
                <div className="max-h-[400px] overflow-y-auto space-y-1 bg-white rounded border border-gray-200">
                    {filteredSupplies.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No se encontraron insumos con este filtro.
                        </div>
                    ) : (
                        filteredSupplies.map(item => {
                            const assignedUser = users.find(u => u.id === item.assigned_user_id)
                            const isSelected = selectedIds.has(item.id)

                            return (
                                <div
                                    key={item.id}
                                    onClick={(e) => {
                                        // Allow clicking row to toggle, unless clicking a link/button (not dealing with inputs specifically here but good practice)
                                        handleToggleSelect(item.id)
                                    }}
                                    className={`grid grid-cols-12 gap-2 p-2 items-center text-sm border-b cursor-pointer hover:bg-orange-50 transition-colors ${isSelected ? 'bg-orange-50' : ''}`}
                                >
                                    <div className="col-span-1 text-center flex justify-center w-full">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => { }} // Handled by row click
                                            className="w-4 h-4"
                                        />
                                    </div>
                                    <div className="col-span-11 md:col-span-6 font-medium text-gray-800">
                                        {item.name}
                                        <span className="text-gray-400 text-xs ml-2 font-normal">{item.unit}</span>
                                    </div>
                                    <div className="hidden md:block col-span-5 text-gray-600 text-xs">
                                        {assignedUser ? (
                                            <span className="flex items-center gap-1">
                                                👤 <strong>{assignedUser.display_name}</strong>
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">-- General --</span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
