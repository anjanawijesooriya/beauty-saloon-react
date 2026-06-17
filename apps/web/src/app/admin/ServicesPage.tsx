import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Clock, X } from 'lucide-react'
import { useServices, useServiceCategories, useCreateService, useUpdateService, useDeleteService } from '@/hooks/useServices'
import type { Service } from '@/types'

const schema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  description: z.string().max(1000).optional(),
  durationMins: z.coerce.number().int().min(15).max(480),
  basePriceLKR: z.coerce.number().positive(),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

function ServiceModal({
  service,
  onClose,
}: {
  service?: Service
  onClose: () => void
}) {
  const { data: categories } = useServiceCategories()
  const { mutateAsync: create, isPending: creating } = useCreateService()
  const { mutateAsync: update, isPending: updating } = useUpdateService()
  const isEdit = !!service

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? schema.partial().omit({ slug: true }) : schema),
    defaultValues: service
      ? {
          categoryId: service.category.id,
          name: service.name,
          slug: service.slug,
          description: service.description ?? '',
          durationMins: service.durationMins,
          basePriceLKR: Number(service.basePriceLKR),
          imageUrl: service.imageUrl ?? '',
        }
      : undefined,
  })

  const onSubmit = async (data: FormValues) => {
    const payload = { ...data, imageUrl: data.imageUrl || undefined }
    if (isEdit) {
      await update({ id: service.id, ...payload })
    } else {
      await create(payload as any)
    }
    onClose()
  }

  const isPending = creating || updating

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <h2 className="font-semibold text-neutral-900">{isEdit ? 'Edit Service' : 'New Service'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
            <select {...register('categoryId')} className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
              <option value="">Select category…</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
            <input {...register('name')} className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Classic Manicure" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Slug</label>
              <input {...register('slug')} className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="classic-manicure" />
              {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
            <textarea {...register('description')} rows={3} className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Duration (min)</label>
              <input {...register('durationMins')} type="number" min={15} className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              {errors.durationMins && <p className="text-red-500 text-xs mt-1">{errors.durationMins.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Price (LKR)</label>
              <input {...register('basePriceLKR')} type="number" min={0} className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              {errors.basePriceLKR && <p className="text-red-500 text-xs mt-1">{errors.basePriceLKR.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Image URL <span className="text-neutral-400 font-normal">(optional)</span></label>
            <input {...register('imageUrl')} type="url" className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="https://…" />
            {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminServicesPage() {
  const [modal, setModal] = useState<{ open: boolean; service?: Service }>({ open: false })
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>()
  const { data, isLoading } = useServices({ categoryId: categoryFilter, limit: 50 })
  const { data: categories } = useServiceCategories()
  const { mutate: deleteService } = useDeleteService()

  const handleDelete = (service: Service) => {
    if (confirm(`Remove "${service.name}"? It will be hidden from customers.`)) {
      deleteService(service.id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Services</h1>
          <p className="text-neutral-500 text-sm mt-0.5">{data?.total ?? '—'} services across {categories?.length ?? '—'} categories</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> New Service
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setCategoryFilter(undefined)} className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-colors ${!categoryFilter ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
          All
        </button>
        {categories?.map((c) => (
          <button key={c.id} onClick={() => setCategoryFilter(c.id)} className={`px-4 py-1.5 rounded-pill text-xs font-medium transition-colors ${categoryFilter === c.id ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">Service</th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">Category</th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">Duration</th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">Price (LKR)</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-neutral-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              : data?.services.map((service) => (
                  <tr key={service.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 text-brand-300 font-display italic text-lg">
                          {service.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">{service.name}</p>
                          {service.description && <p className="text-xs text-neutral-400 line-clamp-1 max-w-xs">{service.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-brand-50 text-brand-600 px-2.5 py-1 rounded-pill font-medium">{service.category.name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-neutral-600">
                        <Clock size={13} className="text-neutral-400" />
                        {service.durationMins} min
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-neutral-900">
                      {Number(service.basePriceLKR).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setModal({ open: true, service })}
                          className="p-1.5 text-neutral-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!isLoading && !data?.services.length && (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-display italic text-2xl mb-2">No services yet</p>
            <button onClick={() => setModal({ open: true })} className="text-brand-400 text-sm hover:underline">Add the first one</button>
          </div>
        )}
      </div>

      {modal.open && (
        <ServiceModal service={modal.service} onClose={() => setModal({ open: false })} />
      )}
    </div>
  )
}
