import Image from 'next/image'
import { login } from './actions'

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#3B1F1A] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with Logo */}
        <div className="bg-[#2A1512] p-8 flex flex-col items-center justify-center border-b-4 border-[#C08A3E]">
          <div className="relative w-32 h-32 mb-4">
            <Image
              src="/icons/LOGO_TBH.png"
              alt="Trailer Burger Hall Logo"
              fill
              sizes="128px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-[#C08A3E] font-display text-2xl font-bold tracking-wider uppercase">
            Portal Admin
          </h1>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form action={login} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="email">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C08A3E] focus:border-[#C08A3E] outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="admin@trailer.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#C08A3E] focus:border-[#C08A3E] outline-none transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#6B8E62] hover:bg-[#5a7a52] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Trailer Burger Hall. Acceso restringido.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}