import { login } from './actions' // Importamos la Server Action

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <section className="max-w-md mx-auto p-8 border rounded-lg shadow-md bg-white mt-10">
      <h1 className="font-bold text-2xl mb-6 text-center text-gray-800">Iniciar sesión</h1>

      <form action={login} className="space-y-4">
        {/* Mostramos errores que vienen de la URL (enviados por la action) */}
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="email">Email</label>
          <input
            id="email"
            name="email" // Importante: name="email" para que FormData lo capture
            type="email"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="admin@trailer.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700" htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password" // Importante: name="password"
            type="password"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-orange-700 transition-colors"
        >
          Entrar
        </button>
      </form>
    </section>
  )
}