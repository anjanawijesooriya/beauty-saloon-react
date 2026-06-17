import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft, Star, ChevronRight } from 'lucide-react'
import { useService } from '@/hooks/useServices'
import { fadeUp, staggerContainer } from '@/lib/motion'

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: service, isLoading } = useService(id!)

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-64 bg-neutral-100 rounded-2xl" />
        <div className="h-6 w-48 bg-neutral-100 rounded" />
        <div className="h-4 w-full bg-neutral-100 rounded" />
        <div className="h-4 w-3/4 bg-neutral-100 rounded" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400">
        <p className="text-lg font-display italic">Service not found</p>
        <Link to="/services" className="mt-4 text-brand-400 text-sm hover:underline">Browse all services</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link to="/services" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-400 transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Services
      </Link>

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid md:grid-cols-5 gap-8">
        {/* Image */}
        <motion.div variants={fadeUp} className="md:col-span-3">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-brand-50 to-brand-100 aspect-[4/3] flex items-center justify-center">
            {service.imageUrl ? (
              <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-display text-9xl italic text-brand-200">{service.category.name[0]}</span>
            )}
          </div>

          {/* Stylists who offer this service */}
          {(service as any).stylistServices?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-neutral-900 mb-3">Available with</h3>
              <div className="flex gap-3 flex-wrap">
                {(service as any).stylistServices.map((ss: any) => (
                  <Link
                    key={ss.id}
                    to={`/stylists/${ss.stylist.id}`}
                    className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2 hover:border-brand-300 hover:shadow-sm transition-all"
                  >
                    <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {ss.stylist.user.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{ss.stylist.user.name}</p>
                      <p className="text-xs text-brand-500">LKR {Number(ss.priceLKR).toLocaleString()}</p>
                    </div>
                    <ChevronRight size={14} className="text-neutral-400 ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div variants={fadeUp} className="md:col-span-2">
          <span className="text-xs font-medium text-brand-500 bg-brand-50 px-3 py-1 rounded-pill">
            {service.category.name}
          </span>

          <h1 className="font-display text-4xl italic text-neutral-900 mt-3">{service.name}</h1>

          {service.description && (
            <p className="text-neutral-600 mt-4 leading-relaxed">{service.description}</p>
          )}

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-neutral-600">
              <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
                <Clock size={17} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Duration</p>
                <p className="font-medium text-neutral-900">{service.durationMins} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-neutral-600">
              <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
                <Star size={17} className="text-brand-400" />
              </div>
              <div>
                <p className="text-xs text-neutral-400">Starting from</p>
                <p className="font-bold text-brand-500 text-lg">LKR {Number(service.basePriceLKR).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Link
            to={`/book?serviceId=${service.id}`}
            className="mt-8 w-full flex items-center justify-center py-3.5 gradient-brand text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Book This Service
          </Link>

          <Link
            to="/stylists"
            className="mt-3 w-full flex items-center justify-center py-3 border border-brand-400 text-brand-400 rounded-xl font-medium hover:bg-brand-50 transition-colors text-sm"
          >
            Browse Stylists First
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
