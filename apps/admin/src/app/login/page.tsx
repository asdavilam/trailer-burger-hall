import Image from 'next/image'
import { LoginForm } from './LoginForm'
import { InstallPWA } from '@/components/InstallPWA'
import { APP_VERSION } from '@/lib/version'

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
          <LoginForm initialError={error} />

          <div className="mt-6 text-center space-y-4">
            <div className="flex justify-center">
              <InstallPWA />
            </div>
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