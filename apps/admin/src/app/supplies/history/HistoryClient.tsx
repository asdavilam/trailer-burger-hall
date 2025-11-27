'use client'

import { useState, useEffect } from 'react'

type Log = {
    id: string
    created_at: string
    user_profiles: { display_name: string }
    supplies: { name: string; unit: string }
    initial_stock: number
    final_count: number
    comments?: string
}

type GroupedSession = {
    id: string // Usamos el ID del primer log como key
    timestamp: string
    user: string
    logs: Log[]
}

export function HistoryClient({ logs }: { logs: any[] }) {
    // 1. Agrupar logs por "Sesión" (mismo usuario, diferencia < 2 minutos)
    const sessions: GroupedSession[] = []

    // Ordenamos por fecha descendente (ya vienen así de la DB, pero aseguramos)
    const sortedLogs = [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    sortedLogs.forEach(log => {
        const logTime = new Date(log.created_at).getTime()
        const lastSession = sessions[sessions.length - 1]

        // Criterio de agrupación:
        // - Existe una sesión previa
        // - Mismo usuario
        // - Diferencia de tiempo menor a 2 minutos (120000 ms)
        if (lastSession &&
            lastSession.user === (log.user_profiles?.display_name || 'Desconocido') &&
            Math.abs(new Date(lastSession.timestamp).getTime() - logTime) < 120000
        ) {
            lastSession.logs.push(log)
        } else {
            // Nueva sesión
            sessions.push({
                id: log.id,
                timestamp: log.created_at,
                user: log.user_profiles?.display_name || 'Desconocido',
                logs: [log]
            })
        }
    })

    return (
        <div className="space-y-4">
            {sessions.length === 0 && (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                    No hay registros para esta fecha.
                </div>
            )}

            {sessions.map(session => (
                <SessionCard key={session.id} session={session} />
            ))}
        </div>
    )
}

function SessionCard({ session }: { session: GroupedSession }) {
    const [isOpen, setIsOpen] = useState(false)
    const [time, setTime] = useState('')

    useEffect(() => {
        setTime(new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, [session.timestamp])

    const itemCount = session.logs.length

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all">
            {/* Header Clickable */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {session.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                            {time} <span className="text-gray-300">|</span> {session.user}
                        </div>
                        <div className="text-sm text-gray-500">
                            {itemCount} movimiento{itemCount !== 1 ? 's' : ''} registrado{itemCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                <div className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-400`}>
                    ▼
                </div>
            </button>

            {/* Detalles (Accordion) */}
            {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left font-medium text-gray-500 pb-2">Insumo</th>
                                <th className="text-right font-medium text-gray-500 pb-2">Inicial</th>
                                <th className="text-right font-medium text-gray-500 pb-2">Final</th>
                                <th className="text-right font-medium text-gray-500 pb-2">Dif</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {session.logs.map(log => {
                                const diff = log.final_count - log.initial_stock
                                const isLoss = diff < 0
                                return (
                                    <tr key={log.id}>
                                        <td className="py-2">
                                            <div className="font-bold text-gray-700">{log.supplies?.name}</div>
                                            <div className="text-xs text-gray-400">{log.supplies?.unit}</div>
                                        </td>
                                        <td className="py-2 text-right text-gray-500">{log.initial_stock}</td>
                                        <td className="py-2 text-right font-bold text-gray-900">{log.final_count}</td>
                                        <td className="py-2 text-right">
                                            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${diff === 0 ? 'bg-gray-200 text-gray-600' :
                                                isLoss ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                {diff > 0 ? '+' : ''}{diff}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
