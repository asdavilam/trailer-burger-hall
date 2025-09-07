// Evitar SSG/ISR: esta página depende de cookies/auth
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

import LoginClient from './LoginClient'

export default function AdminLoginPage() {
  return <LoginClient />
}