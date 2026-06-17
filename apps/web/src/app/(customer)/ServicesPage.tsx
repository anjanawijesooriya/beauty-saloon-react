import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Search, SlidersHorizontal, X } from 'lucide-react'
import { useServices, useServiceCategories } from '@/hooks/useServices'
import { staggerContainer, fadeUp, scaleIn } from '@/lib/motion'

function ServiceSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-pulse">
      <div className="h-44 bg-neutral-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-neutral-100 rounded-pill" />
        <div className="h-4 w-3/4 bg-neutral-100 rounded" />
        <div className="h-3 w-1/3 bg-neutral-100 rounded" />
        <div className="flex justify-between mt-4">
          <div className="h-4 w-24 bg-neutral-100 rounded" />
          <div className="h-8 w-20 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [showFilters, setShowFilters] = useState(false)

  const categoryId = searchParams.get('category') || undefined
  const page = Number(searchParams.get('page') || '1')

  const { data: categories } = useServiceCategories()
  const { data, isLoading, isFetching } = useServices({
    categoryId,
    search: debouncedSearch,
    page,
    limit: 12,
  })

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const setCategory = (id?: string) => {
    const next = new URLSearchParams(searchParams)
    if (id) next.set('category', id)
    else next.delete('category')
    next.delete('page')
    setSearchParams(next)
  }

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeCategory = categories?.find((c) => c.id === categoryId)

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="gradient-hero py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="text-brand-400 font-medium tracking-widest uppercase text-xs mb-2">
              What we offer
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-display text-5xl italic text-neutral-900">
              Our Services
            </motion.h1>
            <motion.p variants={fadeUp} className="text-neutral-500 mt-2">
              {data ? `${data.total} services available` : 'Explore our full range of beauty treatments'}
            </motion.p>
          </motion.div>

          {/* Search */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-8 max-w-xl relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category pills */}
        <div className="flex items-center gap-3 flex-wrap mb-8">
          <button
            onClick={() => setCategory(undefined)}
            className={`px-5 py-2 rounded-pill text-sm font-medium transition-all ${
              !categoryId ? 'gradient-brand text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-500'
            }`}
          >
            All Services
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-5 py-2 rounded-pill text-sm font-medium transition-all ${
                categoryId === cat.id ? 'gradient-brand text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-pill text-sm font-medium text-neutral-600 hover:border-brand-300 hover:text-brand-500 transition-all"
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>

        {/* Active filter badge */}
        {activeCategory && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-neutral-500">Showing:</span>
            <span className="flex items-center gap-1.5 bg-brand-50 text-brand-600 text-sm font-medium px-3 py-1 rounded-pill">
              {activeCategory.name}
              <button onClick={() => setCategory(undefined)}><X size={13} /></button>
            </span>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ServiceSkeleton key={i} />)}
          </div>
        ) : !data?.services.length ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl italic text-neutral-300 mb-2">No services found</p>
            <p className="text-neutral-400 text-sm">Try a different category or search term</p>
            <button onClick={() => { setSearch(''); setCategory(undefined) }} className="mt-4 text-brand-400 text-sm font-medium hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <motion.div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isFetching ? 'opacity-70' : ''} transition-opacity`}
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {data.services.map((service) => (
                <motion.div key={service.id} variants={scaleIn}>
                  <Link
                    to={`/services/${service.id}`}
                    className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image / placeholder */}
                    <div className="h-44 bg-gradient-to-br from-brand-50 to-brand-100 relative overflow-hidden">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-5xl italic text-brand-200">{service.category.name[0]}</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-xs font-medium text-brand-600 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-pill">
                        {service.category.name}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-neutral-500 text-xs mt-1.5 line-clamp-2 flex-1">{service.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-neutral-400 text-xs mt-3">
                        <Clock size={12} />
                        <span>{service.durationMins} min</span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                        <span className="font-bold text-brand-500">
                          LKR {Number(service.basePriceLKR).toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-white gradient-brand px-3 py-1.5 rounded-lg group-hover:opacity-90 transition-opacity">
                          Book
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-300 hover:text-brand-500 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 text-sm rounded-lg font-medium transition-all ${
                      p === page ? 'gradient-brand text-white' : 'border border-neutral-200 hover:border-brand-300 hover:text-brand-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.totalPages}
                  className="px-4 py-2 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-300 hover:text-brand-500 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
