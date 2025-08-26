"use client"
import { motion } from 'framer-motion'

export default function Reviews() {
  const reviews = [
    {
      author: 'Carlos M.',
      text:
        'Las mejores hamburguesas que he probado, el sabor es único y se nota lo artesanal.',
      rating: 5,
    },
    {
      author: 'Ana G.',
      text:
        'El lugar perfecto para venir con amigos, el menú es variado y todo está delicioso.',
      rating: 5,
    },
    {
      author: 'Luis R.',
      text:
        'El servicio es excelente y las promociones de la semana valen mucho la pena.',
      rating: 5,
    },
  ]

  return (
    <section aria-labelledby="reviews-heading" className="space-y-6">
      <h2
        id="reviews-heading"
        className="text-2xl font-semibold text-center text-[#3B1F1A]"
      >
        Lo que dicen nuestros clientes
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <motion.figure
            key={i}
            whileHover={{ y: -4}}
            className="rounded-2xl bg-white border border-[#F6F1E7] shadow p-6 h-full"
          >
            {/* Estrellas accesibles (decorativas) */}
            <div className="mb-3 flex items-center" aria-hidden="true">
              {Array.from({ length: r.rating }).map((_, idx) => (
                <svg key={idx} viewBox="0 0 20 20" className="h-5 w-5 fill-[#C08A3E]">
                  <path d="M10 1.5l2.7 5.5 6.1.9-4.4 4.3 1 6.1L10 15.8 4.6 18.3l1-6.1L1.2 7.9l6.1-.9L10 1.5z" />
                </svg>
              ))}
            </div>

            <blockquote className="text-gray-700 italic text-sm sm:text-base">
              “{r.text}”
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-[#3B1F1A]">
              — {r.author}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}