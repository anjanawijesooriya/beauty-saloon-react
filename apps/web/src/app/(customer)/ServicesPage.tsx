import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import { useServices, useServiceCategories } from '@/hooks/useServices'

export default function ServicesPage() {
  const [categoryId, setCategoryId] = useState<string | undefined>()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useServices({ categoryId, search })
  const { data: categories } = useServiceCategories()

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">Our Services</h1>

      <div className="flex gap-3 flex-wrap mb-6">
        <button
          onClick={() => setCategoryId(undefined)}
          className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${!categoryId ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
        >
          All
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryId(cat.id)}
            className={`px-4 py-2 rounded-pill text-sm font-medium transition-colors ${categoryId === cat.id ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <input
        type="search"
        placeholder="Search services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md px-4 py-2.5 border border-neutral-200 rounded-lg mb-8 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5">
              {service.imageUrl && <img src={service.imageUrl} alt={service.name} className="w-full h-36 object-cover rounded-xl mb-4" />}
              <span className="text-xs font-medium text-brand-400 bg-brand-50 px-2 py-1 rounded-pill">{service.category.name}</span>
              <h3 className="font-semibold text-neutral-900 mt-2">{service.name}</h3>
              <div className="flex items-center gap-1 text-neutral-500 text-sm mt-1">
                <Clock size={14} />
                <span>{service.durationMins} min</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="font-semibold text-brand-500">LKR {Number(service.basePriceLKR).toLocaleString()}</span>
                <Link to={`/book?serviceId=${service.id}`} className="flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-600">
                  Book <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
