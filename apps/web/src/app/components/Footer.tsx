// src/app/components/Footer.tsx
import { getHomeData } from '@/lib/data'

type SettingsValue = {
  restaurant_name?: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  social?: Record<string, string>
}

/** Ícono re-coloreable usando CSS mask con un .svg en /public/icons */
function IconMask({
  href,
  src,          // e.g. "/icons/facebook.svg"
  label,
  size = 22,
  color = '#F6F1E7', // color claro por tu footer oscuro
}: {
  href: string
  src: string
  label: string
  size?: number
  color?: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C08A3E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3B1F1A]"
      style={{
        width: size,
        height: size,
      }}
    >
      <span
        aria-hidden
        style={{
          width: size,
          height: size,
          display: 'inline-block',
          backgroundColor: color,
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
      />
    </a>
  )
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
            {/* si quieres seguir mostrando el PNG del logo */}
            <img
              src="/icons/logo.ico"
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

        {/* Redes sociales — usa IconMask con las rutas en /public/icons/*.svg */}
        {Object.keys(social).length > 0 && (
          <div className="flex gap-5">
            {social.instagram && (
              <IconMask
                href={social.instagram}
                src="/icons/instagram.svg"
                label="Instagram"
                // color y size opcionales:
                // color="#F6F1E7"
                // size={22}
              />
            )}
            {social.facebook && (
              <IconMask
                href={social.facebook}
                src="/icons/facebook.svg"
                label="Facebook"
              />
            )}
            {social.whatsapp && (
              <IconMask
                href={s.whatsapp ?? '#'}
                src="/icons/whatsapp.svg"
                label="WhatsApp"
              />
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