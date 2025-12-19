'use client'

import React from 'react'
import { POSAccountWithItems } from '@trailer/shared'
import { NewOrderButton } from '@/components/NewOrderButton'
import { AccountsList } from '@/components/AccountsList'
import { formatCurrency } from '@/lib/currency'
import { Receipt, TrendingUp } from 'lucide-react'

interface POSContentProps {
    initialAccounts: POSAccountWithItems[]
}

export function POSContent({ initialAccounts }: POSContentProps) {
    const [accounts, setAccounts] = React.useState(initialAccounts)
    const [isRefreshing, setIsRefreshing] = React.useState(false)

    const handleRefresh = async () => {
        setIsRefreshing(true)
        // Refresh the page to get updated data
        window.location.reload()
    }

    const stats = React.useMemo(() => {
        const totalPending = accounts.reduce((sum, acc) => sum + acc.pending_balance, 0)
        const openCount = accounts.length
        return { totalPending, openCount }
    }, [accounts])

    return (
        <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card bg-gradient-to-br from-bronze/10 to-bronze/5 border-bronze/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-bronze rounded-lg flex items-center justify-center">
                            <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 font-medium">Cuentas Abiertas</div>
                            <div className="text-3xl font-bold text-espresso">{stats.openCount}</div>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-sage/10 to-sage/5 border-sage/20">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sage rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600 font-medium">Saldo Pendiente Total</div>
                            <div className="text-3xl font-bold text-espresso">{formatCurrency(stats.totalPending)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Order Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-espresso">Cuentas</h2>
                <NewOrderButton />
            </div>

            {/* Accounts List */}
            <AccountsList accounts={accounts} onRefresh={handleRefresh} />
        </div>
    )
}
