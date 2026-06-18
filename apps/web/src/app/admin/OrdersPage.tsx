import { format } from 'date-fns'
import { Package } from 'lucide-react'
import { useAdminOrders, useAdminUpdateOrderStatus } from '@/hooks/useOrders'
import type { Order, OrderStatus } from '@/types'

const STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    'bg-amber-50 text-amber-600 border-amber-100',
  PROCESSING: 'bg-blue-50 text-blue-600 border-blue-100',
  SHIPPED:    'bg-purple-50 text-purple-600 border-purple-100',
  DELIVERED:  'bg-emerald-50 text-emerald-600 border-emerald-100',
  CANCELLED:  'bg-red-50 text-red-500 border-red-100',
  REFUNDED:   'bg-neutral-100 text-neutral-500 border-neutral-200',
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders()
  const { mutate: updateStatus } = useAdminUpdateOrderStatus()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-400">{orders?.length ?? 0} total orders</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left text-xs font-medium text-neutral-400 px-6 py-3">Order</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Items</th>
                  <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Total</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Payment</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {!orders?.length ? (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-neutral-400"><Package size={32} className="mx-auto mb-2 opacity-30" />No orders yet</td></tr>
                ) : (orders as Order[]).map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-3 text-xs font-mono text-neutral-500">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-neutral-800">{order.customer?.name}</p>
                      <p className="text-xs text-neutral-400">{order.customer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-600">
                      {order.items.map((i) => i.product.name).join(', ').slice(0, 40)}
                      {order.items.length > 1 ? ` (+${order.items.length - 1})` : ''}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-neutral-800">
                      LKR {Number(order.totalLKR).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                        order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        order.paymentStatus === 'FAILED' ? 'bg-red-50 text-red-500 border-red-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus({ id: order.id, status: e.target.value })}
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium cursor-pointer focus:outline-none ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">{format(new Date(order.createdAt), 'd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
