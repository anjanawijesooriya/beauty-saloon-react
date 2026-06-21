import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cart'
import { fadeUp } from '@/lib/motion'

export default function CartPage() {
  const { items, updateQty, removeItem, totalLKR, totalItems } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-5">
          <ShoppingBag size={36} className="text-brand-300" />
        </div>
        <h2 className="font-display text-3xl italic text-neutral-900 mb-2">Your cart is empty</h2>
        <p className="text-neutral-400 text-sm mb-7 max-w-xs">Discover our curated beauty products and add them to your cart.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          Browse Shop <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">Your Cart <span className="text-neutral-400 text-2xl">({totalItems()})</span></h1>

      <div className="space-y-3 mb-8">
        {items.map(({ product, quantity }) => (
          <motion.div key={product.id} variants={fadeUp} initial="hidden" animate="visible"
            className="flex items-center gap-4 bg-white rounded-2xl shadow-card p-4">
            <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0">
              {product.imageUrls[0]
                ? <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-neutral-300"><ShoppingBag size={22} /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900 line-clamp-1">{product.name}</p>
              <p className="text-xs text-neutral-400 mt-0.5">LKR {Number(product.priceLKR).toLocaleString()} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(product.id, quantity - 1)} className="w-7 h-7 border border-neutral-200 rounded-lg flex items-center justify-center hover:bg-neutral-50 transition-colors">
                <Minus size={12} />
              </button>
              <span className="w-6 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => updateQty(product.id, quantity + 1)}
                disabled={quantity >= product.stock}
                className="w-7 h-7 border border-neutral-200 rounded-lg flex items-center justify-center hover:bg-neutral-50 transition-colors disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>
            <p className="w-28 text-right text-sm font-bold text-neutral-900">
              LKR {(Number(product.priceLKR) * quantity).toLocaleString()}
            </p>
            <button onClick={() => removeItem(product.id)} className="p-1.5 text-neutral-300 hover:text-red-400 transition-colors">
              <Trash2 size={15} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-neutral-500">Subtotal</span>
          <span className="text-sm font-medium text-neutral-800">LKR {totalLKR().toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-neutral-100 mb-4">
          <span className="text-sm text-neutral-500">Shipping</span>
          <span className="text-xs text-neutral-400">Calculated at checkout</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold text-neutral-900">Total</span>
          <span className="text-xl font-bold text-neutral-900">LKR {totalLKR().toLocaleString()}</span>
        </div>
        <Link to="/checkout" className="block w-full py-3.5 gradient-brand text-white rounded-xl text-sm font-semibold text-center hover:opacity-90 transition-opacity">
          Proceed to Checkout →
        </Link>
        <Link to="/shop" className="block text-center text-xs text-neutral-400 hover:text-neutral-600 transition-colors mt-3">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
