import Image from 'next/image'
import { getHomeData } from '@/lib/data'

type SettingsValue = {
  restaurant_name?: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  social?: Record<string, string>
}

export default async function Footer() {
  const { settings } = await getHomeData()
  const s = (settings as SettingsValue) ?? {}
  const social = s.social ?? {}

  return (
    <footer className="mt-16 border-t border-[#C08A3E]/20 bg-[#3B1F1A] text-[#F6F1E7]" role="contentinfo">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Marca + tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="flex items-center gap-2">
            <Image
              src="/icons/logo.png"
              alt={s.restaurant_name ?? 'Trailer Burger Hall'}
              width={70}
              height={70}
              className="rounded-full"
            />
            <span className="font-display text-lg text-[#C08A3E]">
              {s.restaurant_name ?? 'Trailer Burger Hall'}
            </span>
          </div>
          <p className="text-sm text-[#F6F1E7]/80">
            Hamburguesas artesanales, frescas y únicas.
          </p>
        </div>

        {/* Redes sociales */}
        {Object.keys(social).length > 0 && (
          <div className="flex gap-4">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Image src="/icons/instagram.svg" alt="Instagram" width={20} height={20} />
              </a>
            )}
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Image src="/icons/facebook.svg" alt="Facebook" width={20} height={20} />
              </a>
            )}
            {social.whatsapp && (
              <a href={`https://wa.me/${s.whatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <Image src="/icons/whatsapp.svg" alt="WhatsApp" width={20} height={20} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Franja inferior */}
      <div className="border-t border-[#C08A3E]/20 text-center py-4 text-xs text-[#F6F1E7]/60">
        © {new Date().getFullYear()} {s.restaurant_name ?? 'Trailer Burger Hall'} — Todos los derechos reservados
      </div>
    </footer>
  )
}