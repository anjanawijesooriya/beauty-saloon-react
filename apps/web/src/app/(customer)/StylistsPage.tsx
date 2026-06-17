import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useStylists } from '@/hooks/useStylists'

export default function StylistsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useStylists({ search })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">Our Stylists</h1>
      <input
        type="search"
        placeholder="Search stylists..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 border border-neutral-200 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.stylists.map((stylist) => (
            <div key={stylist.id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5">
              <div className="flex items-center gap-3 mb-3">
                {stylist.user.avatarUrl ? (
                  <img src={stylist.user.avatarUrl} alt={stylist.user.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full gradient-brand flex items-center justify-center text-white text-xl font-bold">
                    {stylist.user.name[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-neutral-900">{stylist.user.name}</h3>
                  <div className="flex items-center gap-1 text-gold-500 text-sm">
                    <Star size={14} fill="currentColor" />
                    <span>{stylist.rating.toFixed(1)}</span>
                    <span className="text-neutral-400">({stylist.reviewCount})</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {stylist.specialities.slice(0, 3).map((s) => (
                  <span key={s} className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-pill">{s}</span>
                ))}
              </div>
              <div className="flex gap-2">
                <Link to={`/stylists/${stylist.id}`} className="flex-1 py-2 text-center text-sm border border-brand-400 text-brand-400 rounded-lg hover:bg-brand-50 transition-colors">
                  View Profile
                </Link>
                <Link to={`/book?stylistId=${stylist.id}`} className="flex-1 py-2 text-center text-sm gradient-brand text-white rounded-lg hover:opacity-90 transition-opacity">
                  Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
