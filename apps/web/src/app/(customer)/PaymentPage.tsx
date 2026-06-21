import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ShieldCheck, Package, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeUp } from '@/lib/motion'
import { toast } from 'sonner'
import { useOrder, useSimulatePaymentDev, useVerifyPayment } from '@/hooks/useOrders'
import { useThemeStore } from '@/store/theme'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

// ── Real Stripe payment form (inside <Elements> context) ────────────────────

function StripePaymentForm({ orderId, totalLKR, clientSecret }: { orderId: string; totalLKR: string; clientSecret: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { mutateAsync: verifyPayment } = useVerifyPayment()
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [elementReady, setElementReady] = useState(false)
  const [elementLoadError, setElementLoadError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !elementReady) return
    setPaying(true)
    setError('')

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?payment_done=1`,
      },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.')
      setPaying(false)
      return
    }

    // No redirect (card without 3DS). Extract the exact PI that was confirmed
    // from clientSecret format: "pi_XXXXX_secret_YYYYY"
    const paymentIntentId = clientSecret.split('_secret_')[0]
    try {
      await verifyPayment({ orderId, paymentIntentId })
    } catch {
      // Non-fatal: webhook will catch it in production
    }
    navigate(`/orders/${orderId}?success=1`)
  }

  if (elementLoadError) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold mb-1">Payment form failed to load</p>
            <p className="text-xs text-red-500">{elementLoadError}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Refresh and try again
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!elementReady && (
        <div className="flex items-center justify-center gap-2 py-8 text-neutral-400 text-sm">
          <Spinner /> Loading payment form…
        </div>
      )}
      <div className={elementReady ? 'block' : 'hidden'}>
        <PaymentElement
          options={{ layout: 'tabs' }}
          onReady={() => setElementReady(true)}
          onLoadError={(event) => {
            setElementLoadError(
              (event as any).error?.message ||
              'Payment methods could not be loaded. Please check your Stripe dashboard has card payments enabled for LKR currency.'
            )
          }}
        />
      </div>
      {error && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {elementReady && (
        <button
          type="submit"
          disabled={paying || !stripe || !elements}
          className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {paying ? <><Spinner />Processing…</> : `Pay LKR ${Number(totalLKR).toLocaleString()}`}
        </button>
      )}
      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <ShieldCheck size={12} className="text-emerald-500" />
        Secured by Stripe · 256-bit SSL encryption
      </div>
    </form>
  )
}

// ── Dev-mode simulated payment form ─────────────────────────────────────────

function DevModePayment({ orderId, totalLKR }: { orderId: string; totalLKR: string }) {
  const navigate = useNavigate()
  const { mutate: simulate, isPending } = useSimulatePaymentDev()

  const handleSimulate = () => {
    simulate(orderId, {
      onSuccess: () => {
        toast.success('Payment simulated successfully!')
        navigate(`/orders/${orderId}?success=1`)
      },
    })
  }

  return (
    <div className="space-y-5">
      <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 flex items-start gap-2.5">
        <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-amber-500" />
        <div>
          <span className="font-semibold">Development Mode</span> — No real payment will be processed.
          Use the test card below and click "Simulate Payment" to complete the order.
        </div>
      </div>

      {/* Visual test card */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">Card number</label>
          <div className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-400 bg-neutral-50 font-mono tracking-wider">
            4242 4242 4242 4242
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">Expiry</label>
            <div className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-400 bg-neutral-50">
              12 / 26
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1.5">CVC</label>
            <div className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-400 bg-neutral-50">
              123
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSimulate}
        disabled={isPending}
        className="w-full py-3.5 gradient-brand text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isPending ? <><Spinner />Simulating…</> : `Simulate Payment · LKR ${Number(totalLKR).toLocaleString()}`}
      </button>
      <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-400">
        <ShieldCheck size={12} className="text-neutral-300" />
        Test mode — no real charges will occur
      </div>
    </div>
  )
}

// ── Main PaymentPage ─────────────────────────────────────────────────────────

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const { data: order, isLoading: orderLoading } = useOrder(id!)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isDevMode, setIsDevMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState('')

  // Create / fetch payment intent — AbortController prevents double-creation in React StrictMode
  useEffect(() => {
    if (!id) return
    const controller = new AbortController()
    ;(async () => {
      try {
        const r = await api.post(`/orders/${id}/pay`, undefined, { signal: controller.signal })
        if (r.data.clientSecret === 'dev_mock_secret') {
          setIsDevMode(true)
        } else {
          setClientSecret(r.data.clientSecret)
        }
      } catch (err: any) {
        if (err.code === 'ERR_CANCELED' || err.name === 'CanceledError') return
        setInitError(err?.response?.data?.message || 'Could not initialise payment')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [id])

  // Redirect away if order is already paid
  useEffect(() => {
    if (order?.paymentStatus === 'PAID') {
      navigate(`/orders/${id}`, { replace: true })
    }
  }, [order?.paymentStatus, id, navigate])

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#D4537E',
      colorBackground: theme === 'dark' ? '#1f1f1f' : '#ffffff',
      colorText: theme === 'dark' ? '#f5f5f5' : '#171717',
      colorDanger: '#ef4444',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      borderRadius: '12px',
    },
  }

  if (orderLoading || loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 flex items-center justify-center gap-2 text-neutral-400">
        <Spinner /> Loading payment…
      </div>
    )
  }

  if (initError) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-neutral-600 text-sm mb-5">{initError}</p>
        <Link to="/orders" className="text-brand-400 text-sm hover:underline">← Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        <div>
          <Link to="/orders" className="text-sm text-brand-400 hover:text-brand-500 transition-colors">
            ← Back to orders
          </Link>
          <h1 className="font-display text-4xl italic text-neutral-900 mt-4 mb-1">Secure Payment</h1>
          {order && (
            <p className="text-neutral-500 text-sm">
              Order #{id!.slice(0, 8).toUpperCase()} · LKR {Number(order.totalLKR).toLocaleString()}
            </p>
          )}
        </div>

        {/* Order mini-summary */}
        {order && (
          <div className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-brand-400" />
              <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
                Order Summary
              </span>
            </div>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex-shrink-0 overflow-hidden">
                    {item.product.imageUrls?.[0] ? (
                      <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={12} className="text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-700 truncate">{item.product.name}</p>
                    <p className="text-xs text-neutral-400">×{item.quantity}</p>
                  </div>
                  <p className="text-xs font-semibold text-neutral-700">
                    LKR {(Number(item.priceLKR) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between text-sm font-bold text-neutral-900">
              <span>Total</span>
              <span>LKR {Number(order.totalLKR).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Payment form */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-sm font-semibold text-neutral-700 mb-5">Payment Details</h2>

          {isDevMode ? (
            <DevModePayment orderId={id!} totalLKR={order?.totalLKR ?? '0'} />
          ) : clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
              <StripePaymentForm orderId={id!} totalLKR={order?.totalLKR ?? '0'} clientSecret={clientSecret} />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <AlertCircle size={28} className="mx-auto mb-2 text-neutral-300" />
              <p className="text-sm text-neutral-400">
                Payment unavailable.{' '}
                <button onClick={() => window.location.reload()} className="text-brand-400 hover:underline">
                  Try again
                </button>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
