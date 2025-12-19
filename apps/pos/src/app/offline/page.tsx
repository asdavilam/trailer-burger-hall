'use client';

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-marfil p-6">
            <div className="card max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-wine/10 p-6 rounded-full">
                        <WifiOff className="w-16 h-16 text-wine" strokeWidth={2} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-espresso mb-4 font-display">
                    Sin Conexión
                </h1>

                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                    No hay conexión a internet en este momento. Algunas funciones pueden no estar disponibles.
                </p>

                <div className="bg-bronze/10 border border-bronze/20 rounded-lg p-4 mb-6">
                    <p className="text-sm text-espresso">
                        <strong>Nota:</strong> Esta aplicación requiere conexión para funcionar correctamente.
                        Por favor, verifica tu conexión a internet.
                    </p>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="btn-touch btn-primary w-full"
                >
                    Reintentar Conexión
                </button>
            </div>
        </div>
    );
}
