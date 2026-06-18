import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, ArrowLeft, Plus, Minus, ShoppingCart, Check, PackageX } from 'lucide-react'
import { toast } from 'sonner'
import { useProduct } from '@/hooks/useProducts'
import { useCartStore } from '@/store/cart'
import { fadeUp, staggerContainer } from '@/lib/motion'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = useProduct(slug!)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const cartItems = useCartStore((s) => s.items)

  const cartQty = cartItems.find((i) => i.product.id === product?.id)?.quantity ?? 0

  const handleAddToCart = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) addItem(product)
    toast.success(`${qty} × ${product.name} added to cart`)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-5 w-32 bg-neutral-100 rounded mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-neutral-100 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-neutral-100 rounded" />
            <div className="h-5 w-1/3 bg-neutral-100 rounded" />
            <div className="h-4 w-full bg-neutral-100 rounded" />
            <div className="h-4 w-5/6 bg-neutral-100 rounded" />
            <div className="h-12 w-full bg-neutral-100 rounded-xl mt-6" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400">
        <PackageX size={48} className="mb-4 opacity-30" />
        <p className="text-lg font-display italic mb-4">Product not found</p>
        <Link to="/shop" className="text-brand-400 text-sm hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>
    )
  }

  const images = product.imageUrls.length > 0 ? product.imageUrls : []
  const inStock = product.stock > 0
  const maxQty = Math.min(product.stock, 10)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <Link
        to="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-500 transition-colors mb-8"
      >
        <ArrowLeft size={15} /> Back to Shop
      </Link>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-10 lg:gap-14"
      >
        {/* Image gallery */}
        <motion.div variants={fadeUp} className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100 shadow-card">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-300">
                <ShoppingBag size={64} />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-brand-400' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product info */}
        <motion.div variants={fadeUp} className="flex flex-col">
          <h1 className="font-display text-4xl italic text-neutral-900 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-3xl font-bold text-neutral-900">
              LKR {Number(product.priceLKR).toLocaleString()}
            </span>
          </div>

          {/* Stock badge */}
          <div className="mt-3">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-500 bg-red-50 px-3 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-neutral-600 text-sm leading-relaxed mt-5 border-t border-neutral-100 pt-5">
              {product.description}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="mt-6 space-y-4">
              {/* Qty selector */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-neutral-700">Quantity</span>
                <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-neutral-900">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium text-sm transition-all ${
                    added
                      ? 'bg-green-500 text-white'
                      : 'gradient-brand text-white hover:opacity-90'
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={17} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={17} /> Add to Cart
                    </>
                  )}
                </button>

                <Link
                  to="/cart"
                  className="relative px-5 py-3.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                >
                  <ShoppingCart size={17} />
                  Cart
                  {cartQty > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 gradient-brand text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartQty}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          )}

          {/* Out-of-stock CTA */}
          {!inStock && (
            <Link
              to="/shop"
              className="mt-6 flex items-center justify-center gap-2 py-3.5 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft size={15} /> Browse Other Products
            </Link>
          )}

          {/* Delivery note */}
          <div className="mt-6 pt-5 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs text-neutral-500">
            <div className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">✓</span>
              <span>Authentic, quality-assured products</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">✓</span>
              <span>Island-wide delivery available</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">✓</span>
              <span>Secure checkout with Stripe</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-brand-400 mt-0.5">✓</span>
              <span>Easy returns & exchanges</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
