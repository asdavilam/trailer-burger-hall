'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Cinzel } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['700'], display: 'swap' })

export default function Hero() {
  return (
    <header className="relative overflow-hidden rounded-2xl border bg-[#3B1F1A]">
      <div className="relative h-[320px] sm:h-[420px] md:h-[520px]">
        {/* Imagen optimizada */}
        <Image
          src="/images/hero-burger.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-20 pointer-events-none select-none"
        />
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

        {/* Contenido animado */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6"
        >
          <h1
            className={`${cinzel.className} text-4xl sm:text-5xl font-bold text-white drop-shadow-sm`}
          >
            Trailer Burger Hall
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/90">
            Hamburguesas artesanales · calidad y sabor en cada bocado.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <motion.a
              href="/menu"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-lg bg-[#6B8E62] px-6 py-3 font-semibold text-white hover:bg-[#C08A3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A3E] focus-visible:ring-offset-2 transition"
            >
              Ver Menú
            </motion.a>
            <motion.a
              href="/contacto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-lg border border-[#C08A3E] px-6 py-3 font-semibold text-[#C08A3E] hover:bg-[#C08A3E] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition"
            >
              Contacto
            </motion.a>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
