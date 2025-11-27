import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { UserProfile } from '@trailer/shared'
import { RoleSelect } from './RoleSelect'
import { CreateUserForm } from './CreateUserForm'
import { StatusToggle } from './StatusToggle'
import { LogoutBtn } from '@/components/LogoutBtn'

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const team = profiles as UserProfile[]

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipo de Trabajo 👥</h1>
          <p className="text-gray-500">Administración de usuarios y permisos</p>
        </div>
      </div>

      {/* Formulario de Crear Usuario */}
      <CreateUserForm />

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {team.map((member) => (
              <tr key={member.id} className={member.is_active ? '' : 'bg-gray-50 opacity-60'}>
                <td className="px-6 py-4">
                  <StatusToggle userId={member.id} isActive={member.is_active} />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{member.display_name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </td>
                <td className="px-6 py-4 w-48">
                  <RoleSelect 
                    userId={member.id} 
                    currentRole={member.role}
                    disabled={member.id === user.id || !member.is_active} 
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}