import '@/app/globals.css'
import { Inter, Cinzel, Montserrat } from 'next/font/google'
import Header from './components/Header' // ajusta la ruta si tu alias es distinto
import SWRegister from './components/SWRegister'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import Footer from './components/Footer'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-cinzel',
})
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-montserrat',
})

export const metadata = {
  title: 'Trailer Burger Hall',
  icons:{
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
  description: 'Hamburguesas de sabores · Menú, horarios y contacto',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased`}
      >
        {/* Skip link */}
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-black px-3 py-2 rounded"
        >
          Saltar al contenido
        </a>

        <Header />

        <main id="contenido" role="main" className="flex-1 container mx-auto p-6">
          {children}
        </main>

        <Footer />
        <SWRegister />
        <PWAInstallPrompt />
      </body>
    </html>
  )
}
