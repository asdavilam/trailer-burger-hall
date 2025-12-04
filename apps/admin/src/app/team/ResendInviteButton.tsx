'use client'

import { useState } from 'react'
import { resendInvite } from './actions'
import { Button } from '@/components/ui/Button'

export function ResendInviteButton({ email }: { email: string }) {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleResend = async () => {
        if (!confirm(`¿Reenviar invitación a ${email}?`)) return

        setLoading(true)
        const res = await resendInvite(email)
        setLoading(false)

        if (res?.error) {
            alert('Error: ' + res.error)
        } else {
            setSent(true)
            setTimeout(() => setSent(false), 3000)
        }
    }

    if (sent) {
        return <span className="text-xs font-bold text-green-600">¡Enviado!</span>
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={loading}
            className="text-xs h-7 px-2"
            title="Reenviar correo de invitación"
        >
            {loading ? '...' : '✉️ Reenviar'}
        </Button>
    )
}
