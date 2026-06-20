import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Tag, X } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { useMinPending } from '@/hooks/useMinPending'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { queryClient } from '@/lib/queryClient'
import type { Promotion } from '@/types'

const schema = z.object({
  code:        z.string().min(3).max(20).toUpperCase(),
  description: z.string().max(200).optional(),
  type:        z.enum(['PERCENT', 'FIXED']),
  value:       z.coerce.number().positive(),
  minOrderLKR: z.coerce.number().optional(),
  maxUses:     z.coerce.number().int().optional(),
  expiresAt:   z.string().optional(),
})

type FormValues = z.infer<typeof schema>

function PromotionModal({ onClose }: { onClose: () => void }) {
  const { mutateAsync, isPending: creating } = useMutation({
    mutationFn: (dto: FormValues) => api.post('/promotions', dto).then((r) => r.data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['promotions'] }); toast.success('Promotion created') },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create promotion'),
  })

  const pending = useMinPending(creating)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: 'PERCENT' } })
  const onSubmit = async (v: FormValues) => { await mutateAsync(v); onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-neutral-900">New Promotion</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Code</label>
              <input {...register('code')} placeholder="GLOW20" className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-brand-300" />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Type</label>
              <select {...register('type')} className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300">
                <option value="PERCENT">Percentage</option>
                <option value="FIXED">Fixed (LKR)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Value</label>
              <input {...register('value')} type="number" step="0.01" placeholder="20"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Min Order (LKR)</label>
              <input {...register('minOrderLKR')} type="number" placeholder="Optional"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Max Uses</label>
              <input {...register('maxUses')} type="number" placeholder="Unlimited"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Expires At</label>
              <input {...register('expiresAt')} type="datetime-local"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
              <input {...register('description')} placeholder="20% off all orders over LKR 5,000"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={pending} className="flex-1 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {pending ? (
                <span className="flex items-center justify-center gap-2"><Spinner />Creating…</span>
              ) : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPromotionsPage() {
  const [showModal, setShowModal] = useState(false)
  const { data: promotions, isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: () => api.get('/promotions').then((r) => r.data),
  })

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/promotions/${id}`, { isActive }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promotions'] }),
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Promotions</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Promo
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Code</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Discount</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Uses</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Expires</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {!promotions?.length ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-neutral-400"><Tag size={32} className="mx-auto mb-2 opacity-30" />No promotions yet</td></tr>
              ) : promotions.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3">
                    <span className="font-mono font-semibold text-brand-500 text-sm">{p.code}</span>
                    {p.description && <p className="text-xs text-neutral-400 mt-0.5">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-700">
                    {p.type === 'PERCENT' ? `${Number(p.value)}% off` : `LKR ${Number(p.value).toLocaleString()} off`}
                    {p.minOrderLKR && <span className="text-xs text-neutral-400 ml-1">(min LKR {Number(p.minOrderLKR).toLocaleString()})</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-neutral-600">
                    {p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {p.expiresAt ? format(new Date(p.expiresAt), 'd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle({ id: p.id, isActive: !p.isActive })}
                      className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                        p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                                   : 'bg-neutral-100 text-neutral-400 border-neutral-200 hover:bg-neutral-200'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <PromotionModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
