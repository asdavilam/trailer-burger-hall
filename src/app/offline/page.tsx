export const metadata = {
  title: 'Sin conexión — Trailer Burger Hall',
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-2xl font-bold text-[#3B1F1A]">Estás sin conexión</h1>
        <p className="mt-2 text-gray-600">
          No pudimos cargar la página. Intenta nuevamente cuando tengas internet.
        </p>
        <div className="mt-6 flex justify-center">
          <a
            href="/"
            className="rounded-lg bg-[#6B8E62] px-5 py-2 font-semibold text-white hover:bg-[#C08A3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A3E] focus-visible:ring-offset-2"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </main>
  )
}