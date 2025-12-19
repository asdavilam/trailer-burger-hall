'use client'

import type { POSAccountWithItems } from '@trailer/shared'
import { formatCurrency } from '@/lib/currency'
import { timeAgo } from '@/lib/time'
import { Users, Package } from 'lucide-react'

interface AccountsListProps {
    accounts: POSAccountWithItems[]
    onRefresh?: () => void
}

export function AccountsList({ accounts, onRefresh }: AccountsListProps) {
    if (accounts.length === 0) {
        return (
            <div className="card text-center py-16">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-espresso mb-2">No hay cuentas abiertas</h3>
                        <p className="text-gray-600">
                            Crea una nueva cuenta para comenzar a tomar pedidos
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
                <button
                    key={account.id}
                    onClick={() => {
                        // TODO: Navigate to account details
                        console.log('Open account:', account.id)
                    }}
                    className="card hover:shadow-lg transition-all text-left group cursor-pointer border-2 border-transparent hover:border-bronze"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-espresso group-hover:text-bronze transition-colors line-clamp-1">
                                {account.customer_name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {timeAgo(account.created_at)}
                            </p>
                        </div>
                        <div className="ml-3">
                            {account.service_type === 'dine_in' ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-sage/10 text-sage rounded-full text-sm font-semibold">
                                    🍽️ Aquí
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-bronze/10 text-bronze rounded-full text-sm font-semibold">
                                    📦 Para Llevar
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Balance */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="text-sm text-gray-600 mb-1">Saldo Pendiente</div>
                        <div className="text-3xl font-bold text-espresso">
                            {formatCurrency(account.pending_balance)}
                        </div>
                        {account.items && account.items.length > 0 && (
                            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {account.items.length} {account.items.length === 1 ? 'artículo' : 'artículos'}
                            </div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    )
}
