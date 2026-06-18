import { format } from 'date-fns'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Package, CheckCircle2, Truck, XCircle, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useOrders, useOrder } from '@/hooks/useOrders'
import { fadeUp } from '@/lib/motion'
import type { OrderStatus } from '@/types'

const STATUS: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: 'Pending',    color: 'bg-amber-50 text-amber-600 border-amber-100',       icon: <Clock size={11} /> },
  PROCESSING: { label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-100',          icon: <Package size={11} /> },
  SHIPPED:    { label: 'Shipped',    color: 'bg-purple-50 text-purple-600 border-purple-100',    icon: <Truck size={11} /> },
  DELIVERED:  { label: 'Delivered',  color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle2 size={11} /> },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-50 text-red-500 border-red-100',             icon: <XCircle size={11} /> },
  REFUNDED:   { label: 'Refunded',   color: 'bg-neutral-100 text-neutral-500 border-neutral-200', icon: <XCircle size={11} /> },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS[status] ?? STATUS.PENDING
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const success = params.get('success') === '1'
  const { data: order, isLoading } = useOrder(id!)

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-neutral-400 text-sm">Loading...</div>
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-neutral-400 text-sm">Order not found</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {success && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500 flex-shrink-0" size={20} />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Order Placed Successfully!</p>
            <p className="text-xs text-emerald-600">We'll process your order and update you on the status.</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl italic text-neutral-900">Order Details</h1>
          <p className="text-xs text-neutral-400 mt-1">#{order.id.slice(0, 8).toUpperCase()} · {format(new Date(order.createdAt), 'd MMM yyyy')}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
                  {item.product.imageUrls[0]
                    ? <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-neutral-300"><Package size={16} /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800">{item.product.name}</p>
                  <p className="text-xs text-neutral-400">×{item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">LKR {(Number(item.priceLKR) * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between">
            <span className="text-sm font-bold text-neutral-900">Total</span>
            <span className="text-sm font-bold text-neutral-900">LKR {Number(order.totalLKR).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5">
          <h2 className="text-sm font-semibold text-neutral-700 mb-3">Shipping Address</h2>
          <p className="text-sm text-neutral-600">{order.shippingAddress.fullName}</p>
          <p className="text-sm text-neutral-500">{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 && <p className="text-sm text-neutral-500">{order.shippingAddress.addressLine2}</p>}
          <p className="text-sm text-neutral-500">{order.shippingAddress.city}</p>
          <p className="text-sm text-neutral-500">{order.shippingAddress.phone}</p>
        </div>
      </div>

      <Link to="/orders" className="mt-6 flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 transition-colors">
        ← Back to orders
      </Link>
    </div>
  )
}

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : !orders?.length ? (
        <div className="text-center py-20 text-neutral-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No orders yet</p>
          <Link to="/shop" className="mt-3 text-brand-500 text-sm hover:underline inline-block">Browse the shop</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`}
              className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-shadow group">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={18} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {format(new Date(order.createdAt), 'd MMM yyyy')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <StatusBadge status={order.status} />
                <p className="text-xs font-semibold text-neutral-700">LKR {Number(order.totalLKR).toLocaleString()}</p>
              </div>
              <ArrowRight size={16} className="text-neutral-300 group-hover:text-brand-400 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
