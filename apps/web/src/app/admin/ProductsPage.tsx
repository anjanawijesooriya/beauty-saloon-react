import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2, Package, X } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts'
import type { Product } from '@/types'

const schema = z.object({
  name:        z.string().min(2).max(200),
  slug:        z.string().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Lowercase, numbers, hyphens only'),
  description: z.string().max(2000).optional(),
  priceLKR:    z.coerce.number().positive(),
  stock:       z.coerce.number().int().min(0),
  categoryId:  z.string().min(1, 'Required'),
})

type FormValues = z.infer<typeof schema>

function ProductModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const { mutateAsync: create, isPending: creating } = useCreateProduct()
  const { mutateAsync: update, isPending: updating } = useUpdateProduct()
  const loading = creating || updating

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: product ? {
      name: product.name, slug: product.slug, description: product.description,
      priceLKR: Number(product.priceLKR), stock: product.stock, categoryId: product.categoryId,
    } : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    if (product) await update({ id: product.id, ...values })
    else await create(values)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-neutral-900">{product ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { label: 'Name', key: 'name', placeholder: 'Rose Hip Face Oil' },
            { label: 'Slug', key: 'slug', placeholder: 'rose-hip-face-oil' },
            { label: 'Category ID', key: 'categoryId', placeholder: 'UUID from admin' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{label}</label>
              <input {...register(key as keyof FormValues)} placeholder={placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              {errors[key as keyof FormValues] && <p className="text-xs text-red-500 mt-1">{errors[key as keyof FormValues]?.message as string}</p>}
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-neutral-600 mb-1">Description</label>
            <textarea {...register('description')} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Price (LKR)</label>
              <input {...register('priceLKR')} type="number" step="0.01" placeholder="2500"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              {errors.priceLKR && <p className="text-xs text-red-500 mt-1">{errors.priceLKR.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">Stock</label>
              <input {...register('stock')} type="number" placeholder="50"
                className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
              {loading ? 'Saving...' : product ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminProductsPage() {
  const [modal, setModal] = useState<'create' | Product | null>(null)
  const { data, isLoading } = useProducts({ limit: 50 })
  const { mutate: remove } = useDeleteProduct()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Products</h1>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Product</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Stock</th>
                <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {!data?.products.length ? (
                <tr><td colSpan={5} className="text-center py-12 text-sm text-neutral-400"><Package size={32} className="mx-auto mb-2 opacity-30" />No products yet</td></tr>
              ) : data.products.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                        {p.imageUrls[0] ? <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package size={14} /></div>}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-800">{p.name}</p>
                        <p className="text-xs text-neutral-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-700">LKR {Number(p.priceLKR).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-neutral-600">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-neutral-100 text-neutral-400 border-neutral-200'}`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => setModal(p)} className="p-1.5 text-neutral-400 hover:text-brand-500 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Remove this product?')) remove(p.id) }} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === 'create' ? undefined : modal as Product}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
