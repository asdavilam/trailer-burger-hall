import { createClient } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import { UserProfile } from '@trailer/shared'
import { RoleSelect } from './RoleSelect'
import { CreateUserForm } from './CreateUserForm'
import { StatusToggle } from './StatusToggle'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResponsiveTable } from '@/components/ui/ResponsiveTable'
import { Badge } from '@/components/ui/Badge'

import { DeleteUserButton } from './DeleteUserButton'
import { ResendInviteButton } from './ResendInviteButton'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Traemos perfiles
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  // 2. Traemos usuarios de Auth para ver si confirmaron email
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()

  // Mapa de ID -> AuthUser
  const authUserMap = new Map(authUsers?.map(u => [u.id, u]) || [])

  const team = profiles as UserProfile[]

  const columns = [
    {
      header: 'Estado',
      cell: (member: UserProfile) => {
        const authUser = authUserMap.get(member.id)
        const isConfirmed = authUser?.email_confirmed_at || authUser?.confirmed_at

        if (!isConfirmed) {
          return <Badge variant="warning" className="h-6">Pendiente</Badge>
        }

        return <StatusToggle userId={member.id} isActive={member.is_active} />
      }
    },
    {
      header: 'Usuario',
      cell: (member: UserProfile) => (
        <div>
          <div className="font-medium text-[var(--color-secondary)]">{member.display_name}</div>
          <div className="text-sm text-gray-500">{member.email}</div>
        </div>
      )
    },
    {
      header: 'Rol',
      cell: (member: UserProfile) => (
        <div className="w-48">
          <RoleSelect
            userId={member.id}
            currentRole={member.role}
            disabled={member.id === user.id || !member.is_active}
          />
        </div>
      )
    },
    {
      header: 'Fecha Registro',
      cell: (member: UserProfile) => (
        <span className="text-sm text-gray-500">
          {new Date(member.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Acciones',
      cell: (member: UserProfile) => {
        const authUser = authUserMap.get(member.id)
        const isConfirmed = authUser?.email_confirmed_at || authUser?.confirmed_at

        return (
          member.id !== user.id && (
            <div className="flex items-center gap-2">
              {!isConfirmed && (
                <ResendInviteButton email={member.email} />
              )}
              <DeleteUserButton userId={member.id} userName={member.display_name || 'Usuario'} />
            </div>
          )
        )
      }
    }
  ]

  const renderMobileItem = (member: UserProfile) => {
    const authUser = authUserMap.get(member.id)
    const isConfirmed = authUser?.email_confirmed_at || authUser?.confirmed_at

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-[var(--color-secondary)]">{member.display_name}</h3>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {!isConfirmed ? (
              <Badge variant="warning">Pendiente</Badge>
            ) : (
              <StatusToggle userId={member.id} isActive={member.is_active} />
            )}

            {member.id !== user.id && (
              <div className="flex gap-2 mt-1">
                {!isConfirmed && <ResendInviteButton email={member.email} />}
                <DeleteUserButton userId={member.id} userName={member.display_name || 'Usuario'} />
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Rol</label>
          <RoleSelect
            userId={member.id}
            currentRole={member.role}
            disabled={member.id === user.id || !member.is_active}
          />
        </div>

        <div className="text-xs text-gray-400 text-right">
          Registrado: {new Date(member.created_at).toLocaleDateString()}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <PageHeader
        title="Equipo de Trabajo 👥"
        description="Administración de usuarios y permisos"
      />

      {/* Formulario de Crear Usuario */}
      <div className="mb-8">
        <CreateUserForm />
      </div>

      <ResponsiveTable
        data={team}
        columns={columns}
        renderMobileItem={renderMobileItem}
        keyExtractor={(item) => item.id}
        emptyMessage="No hay usuarios registrados."
      />
    </div>
  )
}