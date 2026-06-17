import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Search, X, Briefcase } from 'lucide-react'
import { useStylists } from '@/hooks/useStylists'
import { staggerContainer, scaleIn, fadeUp } from '@/lib/motion'

const SPECIALTIES = ['Hair Colouring', 'Balayage', 'Keratin Treatments', 'Bridal Makeup', 'Facials', 'Nail Art', 'Gel Nails', 'Massage Therapy']

function StylistSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-neutral-100 rounded w-3/4" />
          <div className="h-3 bg-neutral-100 rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-5">
        <div className="h-6 w-20 bg-neutral-100 rounded-pill" />
        <div className="h-6 w-24 bg-neutral-100 rounded-pill" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-neutral-100 rounded-lg" />
        <div className="flex-1 h-9 bg-neutral-100 rounded-lg" />
      </div>
    </div>
  )
}

export default function StylistsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const specialty = searchParams.get('specialty') || undefined
  const page = Number(searchParams.get('page') || '1')

  const { data, isLoading } = useStylists({ specialty, search: debouncedSearch, page })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const setSpecialty = (s?: string) => {
    const next = new URLSearchParams(searchParams)
    if (s) next.set('specialty', s); else next.delete('specialty')
    next.delete('page')
    setSearchParams(next)
  }

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="gradient-hero py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="text-brand-400 font-medium tracking-widest uppercase text-xs mb-2">Meet the team</motion.p>
            <motion.h1 variants={fadeUp} className="font-display text-5xl italic text-neutral-900">Our Stylists</motion.h1>
            <motion.p variants={fadeUp} className="text-neutral-500 mt-2">
              {data ? `${data.total} talented professionals` : 'Find your perfect beauty match'}
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mt-8 max-w-xl relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              placeholder="Search by name…"
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
        {/* Specialty filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSpecialty(undefined)}
            className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${!specialty ? 'gradient-brand text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-500'}`}
          >
            All Specialties
          </button>
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              onClick={() => setSpecialty(s)}
              className={`px-4 py-2 rounded-pill text-sm font-medium transition-all ${specialty === s ? 'gradient-brand text-white shadow-sm' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-500'}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <StylistSkeleton key={i} />)}
          </div>
        ) : !data?.stylists.length ? (
          <div className="text-center py-20">
            <p className="font-display text-3xl italic text-neutral-300 mb-2">No stylists found</p>
            <button onClick={() => { setSearch(''); setSpecialty(undefined) }} className="mt-2 text-brand-400 text-sm font-medium hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {data.stylists.map((stylist) => (
                <motion.div key={stylist.id} variants={scaleIn}>
                  <div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 p-6 flex flex-col">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 mb-4">
                      {stylist.user.avatarUrl ? (
                        <img src={stylist.user.avatarUrl} alt={stylist.user.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {stylist.user.name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-neutral-900 group-hover:text-brand-500 transition-colors">
                          {stylist.user.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={13} className="text-gold-400 fill-gold-400" />
                          <span className="text-sm font-medium text-neutral-700">{stylist.rating.toFixed(1)}</span>
                          <span className="text-xs text-neutral-400">({stylist.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400 text-xs mt-0.5">
                          <Briefcase size={11} />
                          <span>{stylist.experience} yrs experience</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {stylist.bio && (
                      <p className="text-neutral-500 text-sm leading-relaxed line-clamp-2 mb-4">{stylist.bio}</p>
                    )}

                    {/* Specialities */}
                    <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                      {stylist.specialities.map((s) => (
                        <span key={s} className="text-xs bg-brand-50 text-brand-600 px-2.5 py-0.5 rounded-pill font-medium">{s}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/stylists/${stylist.id}`}
                        className="flex-1 py-2.5 text-center text-sm border border-brand-400 text-brand-400 rounded-xl hover:bg-brand-50 transition-colors font-medium"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/book?stylistId=${stylist.id}`}
                        className="flex-1 py-2.5 text-center text-sm gradient-brand text-white rounded-xl hover:opacity-90 transition-opacity font-medium"
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-300 hover:text-brand-500 transition-colors">Previous</button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 text-sm rounded-lg font-medium transition-all ${p === page ? 'gradient-brand text-white' : 'border border-neutral-200 hover:border-brand-300 hover:text-brand-500'}`}>{p}</button>
                ))}
                <button onClick={() => setPage(page + 1)} disabled={page === data.totalPages} className="px-4 py-2 text-sm border border-neutral-200 rounded-lg disabled:opacity-40 hover:border-brand-300 hover:text-brand-500 transition-colors">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
