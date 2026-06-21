import { useState } from 'react'
import { Users, UserCheck, UserX, Trash2, Search } from 'lucide-react'
import { useAdminUsers, useToggleUserStatus, useDeleteUser } from '@/hooks/useUsers'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import type { AdminUser } from '@/hooks/useUsers'

type PendingAction =
  | { type: 'toggle'; user: AdminUser }
  | { type: 'delete'; user: AdminUser }

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
      isActive
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
        : 'bg-red-50 text-red-500 border-red-100'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<PendingAction | null>(null)

  const { data, isLoading } = useAdminUsers('CUSTOMER')
  const { mutate: toggleStatus, isPending: toggling } = useToggleUserStatus()
  const { mutate: deleteUser, isPending: deleting } = useDeleteUser()

  const filtered = (data?.users ?? []).filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleConfirm = () => {
    if (!pending) return
    if (pending.type === 'toggle') {
      toggleStatus(pending.user.id, { onSuccess: () => setPending(null) })
    } else {
      deleteUser(pending.user.id, { onSuccess: () => setPending(null) })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{data?.total ?? 0} registered customers</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 pr-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-300 w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Customer</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Joined</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {!filtered.length ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-sm text-neutral-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30" />
                    {search ? 'No customers match your search' : 'No customers yet'}
                  </td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold text-sm flex-shrink-0">
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{user.name}</p>
                        <p className="text-xs text-neutral-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{user.phone || '—'}</td>
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge isActive={user.isActive} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => setPending({ type: 'toggle', user })}
                        title={user.isActive ? 'Deactivate account' : 'Activate account'}
                        className="p-1.5 text-neutral-400 hover:text-brand-500 transition-colors"
                      >
                        {user.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                      <button
                        onClick={() => setPending({ type: 'delete', user })}
                        title="Delete account"
                        className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending?.type === 'toggle' && (
        <ConfirmModal
          variant="warning"
          title={pending.user.isActive ? 'Deactivate account?' : 'Activate account?'}
          description={
            pending.user.isActive
              ? `${pending.user.name} will no longer be able to log in or make bookings.`
              : `${pending.user.name} will regain access to their account.`
          }
          confirmLabel={pending.user.isActive ? 'Yes, deactivate' : 'Yes, activate'}
          isPending={toggling}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}

      {pending?.type === 'delete' && (
        <ConfirmModal
          variant="danger"
          title="Delete account permanently?"
          description={`This will remove ${pending.user.name}'s account along with all their appointments, orders, and reviews. This cannot be undone.`}
          confirmLabel="Yes, delete permanently"
          isPending={deleting}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  )
}
