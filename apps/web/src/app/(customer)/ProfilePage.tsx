import { useAuthStore } from '@/store/auth'

export default function ProfilePage() {
  const { user } = useAuthStore()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">My Profile</h1>
      {user && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
              {user.name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-xl text-neutral-900">{user.name}</h2>
              <p className="text-neutral-500">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-sm text-brand-600 font-medium">Role</p>
              <p className="text-neutral-900 font-semibold mt-1">{user.role}</p>
            </div>
            <div className="bg-brand-50 rounded-xl p-4">
              <p className="text-sm text-brand-600 font-medium">Phone</p>
              <p className="text-neutral-900 font-semibold mt-1">{user.phone || '—'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
