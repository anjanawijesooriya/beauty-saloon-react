import { Fragment, useState } from 'react'
import { format } from 'date-fns'
import { Package, ChevronDown, ChevronUp, Copy, Check, CreditCard, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminOrders, useAdminUpdateOrderStatus, useAdminDeleteOrder } from '@/hooks/useOrders'
import type { Order, OrderStatus, PaymentStatus } from '@/types'

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    'bg-amber-50 text-amber-600 border-amber-100',
  PROCESSING: 'bg-blue-50 text-blue-600 border-blue-100',
  SHIPPED:    'bg-purple-50 text-purple-600 border-purple-100',
  DELIVERED:  'bg-emerald-50 text-emerald-600 border-emerald-100',
  CANCELLED:  'bg-red-50 text-red-500 border-red-100',
  REFUNDED:   'bg-neutral-100 text-neutral-500 border-neutral-200',
}

const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  UNPAID:   'bg-amber-50 text-amber-600 border-amber-100',
  PAID:     'bg-emerald-50 text-emerald-600 border-emerald-100',
  FAILED:   'bg-red-50 text-red-500 border-red-100',
  REFUNDED: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1 rounded hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600">
      {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
    </button>
  )
}

function DeleteOrderModal({
  order,
  onClose,
  onConfirm,
  isPending,
}: {
  order: Order
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-modal w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <h3 className="text-center text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
          Delete Order
        </h3>
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mb-1">
          Order <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <p className="text-center text-xs text-neutral-400 mb-6">
          {order.customer?.name} · LKR {Number(order.totalLKR).toLocaleString()}
        </p>
        <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          This will permanently remove the order and all its items. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function OrderDetailPanel({ order }: { order: Order }) {
  return (
    <tr>
      <td colSpan={9} className="px-0 py-0">
        <div className="px-6 pb-5 pt-2 bg-neutral-50 border-t border-neutral-100 grid sm:grid-cols-3 gap-5 text-xs">
          {/* Payment details */}
          <div>
            <p className="font-semibold text-neutral-600 mb-2 flex items-center gap-1.5">
              <CreditCard size={12} className="text-brand-400" /> Payment Details
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-neutral-500">
                <span>Status</span>
                <span className={`px-2 py-0.5 rounded-full font-medium border ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Amount</span>
                <span className="font-semibold text-neutral-700">LKR {Number(order.totalLKR).toLocaleString()}</span>
              </div>
              {order.stripePaymentIntentId ? (
                <div>
                  <span className="text-neutral-400 block mb-0.5">Stripe Payment Intent</span>
                  <div className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 font-mono">
                    <span className="truncate text-neutral-600 min-w-0">{order.stripePaymentIntentId}</span>
                    <CopyButton value={order.stripePaymentIntentId} />
                  </div>
                </div>
              ) : (
                <div className="text-neutral-400">No payment intent recorded</div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div>
            <p className="font-semibold text-neutral-600 mb-2">Shipping Address</p>
            <div className="space-y-0.5 text-neutral-500">
              <p className="font-medium text-neutral-700">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress?.city}</p>
              <p>{order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="font-semibold text-neutral-600 mb-2">Order Items</p>
            <div className="space-y-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-neutral-500">
                  <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="font-medium text-neutral-700 flex-shrink-0">
                    LKR {(Number(item.priceLKR) * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders()
  const { mutate: updateStatus } = useAdminUpdateOrderStatus()
  const { mutate: deleteOrder, isPending: deleting } = useAdminDeleteOrder()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null)

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    deleteOrder(deleteTarget.id, {
      onSuccess: () => {
        setDeleteTarget(null)
        if (expandedId === deleteTarget.id) setExpandedId(null)
      },
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
          <p className="text-sm text-neutral-400 mt-0.5">{orders?.length ?? 0} total orders</p>
        </div>
      </div>

      {deleteTarget && (
        <DeleteOrderModal
          order={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          isPending={deleting}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-neutral-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden sm:table-cell">Items</th>
                  <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Payment</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 w-8" />
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {!orders?.length ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-sm text-neutral-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />No orders yet
                    </td>
                  </tr>
                ) : (orders as Order[]).map((order) => (
                  <Fragment key={order.id}>
                    <tr
                      className={`border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer ${expandedId === order.id ? 'bg-neutral-50' : ''}`}
                      onClick={() => toggle(order.id)}
                    >
                      <td className="px-6 py-3 text-xs font-mono text-neutral-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-neutral-800">{order.customer?.name}</p>
                        <p className="text-xs text-neutral-400">{order.customer?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-600 hidden sm:table-cell max-w-xs">
                        <p className="truncate">
                          {order.items.map((i) => i.product.name).join(', ')}
                          {order.items.length > 1 ? ` (${order.items.length})` : ''}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-neutral-800">
                        LKR {Number(order.totalLKR).toLocaleString()}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus({ id: order.id, status: e.target.value })}
                          className={`text-xs px-2.5 py-1 rounded-full border font-medium cursor-pointer focus:outline-none ${ORDER_STATUS_COLORS[order.status]}`}
                        >
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-400 hidden md:table-cell">
                        {format(new Date(order.createdAt), 'd MMM yyyy')}
                      </td>
                      <td className="px-2 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteTarget(order)}
                          className="p-1.5 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-neutral-400">
                        {expandedId === order.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </td>
                    </tr>
                    {expandedId === order.id && <OrderDetailPanel order={order} />}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
