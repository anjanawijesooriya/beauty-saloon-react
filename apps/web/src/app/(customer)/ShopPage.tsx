import { useState } from 'react'
import { ShoppingBag, Search, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useProducts } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cart'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { Product } from '@/types'

function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem)
  const handleAdd = () => { addItem(product); toast.success(`${product.name} added to cart`) }

  return (
    <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-card overflow-hidden group hover:shadow-card-hover transition-shadow">
      <Link to={`/shop/${product.slug}`}>
        <div className="aspect-square bg-neutral-100 overflow-hidden">
          {product.imageUrls[0] ? (
            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <ShoppingBag size={40} />
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/shop/${product.slug}`}>
          <h3 className="font-semibold text-neutral-900 text-sm hover:text-brand-500 transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-xs text-neutral-400 mt-1">{product.stock > 0 ? `${product.stock} in stock` : <span className="text-red-400">Out of stock</span>}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-neutral-900">LKR {Number(product.priceLKR).toLocaleString()}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="w-8 h-8 gradient-brand text-white rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function ShopPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const cartCount = useCartStore((s) => s.totalItems())

  const { data, isLoading } = useProducts({ search: debouncedSearch || undefined, limit: 24 })

  const handleSearch = (val: string) => {
    setSearch(val)
    clearTimeout((window as any).__shopSearch)
    ;(window as any).__shopSearch = setTimeout(() => setDebouncedSearch(val), 400)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl italic text-neutral-900">Beauty Shop</h1>
          <p className="text-neutral-500 text-sm mt-1">Curated beauty products, delivered to you</p>
        </div>
        <Link to="/cart" className="relative flex items-center gap-2 px-5 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
          <ShoppingBag size={16} />
          Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 gradient-brand text-white text-xs rounded-full flex items-center justify-center font-bold">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent bg-white"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-square bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : !data?.products.length ? (
        <div className="text-center py-20 text-neutral-400">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No products found</p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {data.products.map((p) => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  )
}
