import { LoginForm } from './LoginForm'
import { APP_VERSION } from '@/lib/version'

export default async function POSLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const { error } = await searchParams

    return (
        <div className="min-h-screen flex items-center justify-center bg-espresso p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with Logo */}
                <div className="bg-[#2A1512] p-8 flex flex-col items-center justify-center border-b-4 border-bronze">
                    <div className="relative w-32 h-32 mb-4">
                        <img
                            src="/logo_tbh.png"
                            alt="Trailer Burger Hall Logo"
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <h1 className="text-bronze font-display text-2xl font-bold tracking-wider uppercase">
                        POS TBH
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Sistema de Punto de Venta</p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <LoginForm initialError={error} />

                    <div className="mt-6 text-center space-y-4">
                        <p className="text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} Trailer Burger Hall. Acceso restringido.
                            <span className="block mt-1 opacity-50">{APP_VERSION}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
