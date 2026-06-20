import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Tag, ShoppingBag } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { useMinPending } from '@/hooks/useMinPending'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useCartStore } from '@/store/cart'
import { useCreateOrder } from '@/hooks/useOrders'

const schema = z.object({
  fullName:     z.string().min(2, 'Required'),
  addressLine1: z.string().min(5, 'Required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(2, 'Required'),
  phone:        z.string().min(9, 'Enter a valid phone number'),
})

type FormValues = z.infer<typeof schema>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, totalLKR, clear } = useCartStore()
  const { mutateAsync: createOrder, isPending: placingOrder } = useCreateOrder()
  const pendingOrder = useMinPending(placingOrder)
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [validatingPromo, setValidatingPromo] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const subtotal = totalLKR()
  const finalTotal = Math.max(0, subtotal - promoDiscount)

  const validatePromo = async () => {
    if (!promoCode.trim()) return
    setValidatingPromo(true)
    setPromoError('')
    try {
      const { data } = await api.get('/promotions/validate', { params: { code: promoCode, orderTotal: subtotal } })
      setPromoDiscount(data.discount)
      toast.success(`Promo applied! You save LKR ${data.discount.toLocaleString()}`)
    } catch (err: any) {
      setPromoError(err?.response?.data?.message || 'Invalid code')
      setPromoDiscount(0)
    } finally {
      setValidatingPromo(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!items.length) { toast.error('Your cart is empty'); return }
    try {
      const order = await createOrder({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        promoCode: promoCode || undefined,
        shippingAddress: values,
      })
      clear()
      navigate(`/orders/${order.id}?success=1`)
    } catch {
      // error toast handled in hook
    }
  }

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-neutral-400 text-sm">Your cart is empty.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — shipping */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold text-neutral-900 mb-5">Shipping Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.fullName?.message}>
                <input {...register('fullName')} placeholder="Kavindi Perera"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input {...register('phone')} placeholder="+94 71 234 5678"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address Line 1" error={errors.addressLine1?.message}>
                  <input {...register('addressLine1')} placeholder="No. 10, Galle Road"
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Address Line 2 (optional)" error={errors.addressLine2?.message}>
                  <input {...register('addressLine2')} placeholder="Apartment, suite, etc."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
                </Field>
              </div>
              <Field label="City" error={errors.city?.message}>
                <input {...register('city')} placeholder="Colombo"
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
              </Field>
            </div>
          </div>

          {/* Promo code */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2"><Tag size={16} /> Promo Code</h2>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoDiscount(0); setPromoError('') }}
                placeholder="Enter code"
                className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 uppercase"
              />
              <button type="button" onClick={validatePromo} disabled={validatingPromo || !promoCode}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40">
                {validatingPromo ? <><Spinner size={14} />Checking…</> : 'Apply'}
              </button>
            </div>
            {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
            {promoDiscount > 0 && <p className="text-xs text-emerald-500 mt-2">✓ LKR {promoDiscount.toLocaleString()} discount applied</p>}
          </div>
        </div>

        {/* Right — order summary */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden">
                    {product.imageUrls[0]
                      ? <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-neutral-300"><ShoppingBag size={14} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-neutral-400">×{quantity}</p>
                  </div>
                  <p className="text-xs font-semibold">LKR {(Number(product.priceLKR) * quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-100 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>Subtotal</span><span>LKR {subtotal.toLocaleString()}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount</span><span>-LKR {promoDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                <span>Total</span><span>LKR {finalTotal.toLocaleString()}</span>
              </div>
            </div>
            <button type="submit" disabled={pendingOrder}
              className="mt-5 w-full py-3.5 gradient-brand text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
              {pendingOrder ? <><Spinner />Placing Order…</> : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
