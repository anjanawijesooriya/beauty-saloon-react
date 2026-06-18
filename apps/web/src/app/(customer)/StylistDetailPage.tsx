import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Briefcase, ArrowLeft, Clock, ChevronRight, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { useStylist } from '@/hooks/useStylists'
import { useStylistReviews } from '@/hooks/useReviews'
import { fadeUp, staggerContainer } from '@/lib/motion'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
type Tab = 'services' | 'portfolio' | 'availability' | 'reviews'

export default function StylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: stylist, isLoading } = useStylist(id!)
  const { data: reviews } = useStylistReviews(id!)
  const [tab, setTab] = useState<Tab>('services')

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-56 bg-neutral-100 rounded-2xl" />
        <div className="h-5 w-48 bg-neutral-100 rounded" />
        <div className="h-4 w-full bg-neutral-100 rounded" />
      </div>
    )
  }

  if (!stylist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-neutral-400">
        <p className="text-lg font-display italic">Stylist not found</p>
        <Link to="/stylists" className="mt-4 text-brand-400 text-sm hover:underline">Browse all stylists</Link>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'services',     label: `Services (${(stylist as any).services?.length ?? 0})` },
    { key: 'portfolio',    label: `Portfolio (${stylist.portfolioUrls?.length ?? 0})` },
    { key: 'availability', label: 'Availability' },
    { key: 'reviews',      label: `Reviews (${stylist.reviewCount})` },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero banner */}
      <div className="gradient-hero py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link to="/stylists" className="inline-flex items-center gap-1.5 text-sm text-brand-500 hover:text-brand-600 mb-8 transition-colors">
            <ArrowLeft size={16} /> All Stylists
          </Link>

          <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-6" variants={staggerContainer} initial="hidden" animate="visible">
            {/* Avatar */}
            <motion.div variants={fadeUp}>
              {stylist.user.avatarUrl ? (
                <img src={stylist.user.avatarUrl} alt={stylist.user.name} className="w-24 h-24 rounded-2xl object-cover shadow-card" />
              ) : (
                <div className="w-24 h-24 rounded-2xl gradient-brand flex items-center justify-center text-white text-4xl font-bold shadow-card">
                  {stylist.user.name[0]}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div variants={fadeUp} className="flex-1">
              <h1 className="font-display text-4xl italic text-neutral-900">{stylist.user.name}</h1>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-gold-400 fill-gold-400" />
                  <span className="font-semibold text-neutral-800">{stylist.rating.toFixed(1)}</span>
                  <span className="text-neutral-400 text-sm">({stylist.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500 text-sm">
                  <Briefcase size={14} />
                  <span>{stylist.experience} years experience</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-pill ${stylist.isAvailable ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {stylist.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {stylist.specialities.map((s) => (
                  <span key={s} className="text-xs bg-white/80 border border-brand-200 text-brand-600 px-2.5 py-0.5 rounded-pill font-medium">{s}</span>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp}>
              <Link
                to={`/book?stylistId=${stylist.id}`}
                className="px-6 py-3 gradient-brand text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-card whitespace-nowrap"
              >
                Book Appointment
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Bio */}
        {stylist.bio && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h2 className="font-semibold text-neutral-900 mb-2">About</h2>
            <p className="text-neutral-600 leading-relaxed">{stylist.bio}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 mb-6 gap-1">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === key ? 'border-brand-400 text-brand-500' : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* Services tab */}
            {tab === 'services' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(stylist as any).services?.length === 0 ? (
                  <p className="text-neutral-400 text-sm col-span-2 py-8 text-center">No services listed yet.</p>
                ) : (
                  (stylist as any).services?.map((ss: any) => (
                    <Link
                      key={ss.id}
                      to={`/book?stylistId=${stylist.id}&serviceId=${ss.service.id}`}
                      className="group bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all p-4 flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 font-display italic text-brand-300 text-xl">
                        {ss.service.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 group-hover:text-brand-500 transition-colors text-sm">{ss.service.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-400 flex items-center gap-1"><Clock size={10} /> {ss.service.durationMins} min</span>
                          <span className="text-xs font-semibold text-brand-500">LKR {Number(ss.priceLKR).toLocaleString()}</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-neutral-300 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Portfolio tab */}
            {tab === 'portfolio' && (
              stylist.portfolioUrls?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {stylist.portfolioUrls.map((url, i) => (
                    <img key={i} src={url} alt={`Portfolio ${i + 1}`} className="w-full aspect-square object-cover rounded-xl shadow-card" />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-neutral-300">
                  <p className="font-display italic text-2xl mb-2">No portfolio yet</p>
                  <p className="text-sm">Check back soon!</p>
                </div>
              )
            )}

            {/* Availability tab */}
            {tab === 'availability' && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Weekly Schedule</h3>
                {!(stylist as any).availabilities?.length ? (
                  <p className="text-neutral-400 text-sm">No availability set yet.</p>
                ) : (
                  <div className="space-y-2">
                    {DAYS.map((day, i) => {
                      const slot = (stylist as any).availabilities?.find((a: any) => a.dayOfWeek === i)
                      return (
                        <div key={day} className={`flex items-center gap-4 py-2.5 px-4 rounded-xl text-sm ${slot ? 'bg-brand-50' : 'bg-neutral-50'}`}>
                          <span className={`w-10 font-medium ${slot ? 'text-brand-600' : 'text-neutral-400'}`}>{day}</span>
                          {slot ? (
                            <div className="flex items-center gap-2 text-brand-700">
                              <CheckCircle2 size={14} className="text-brand-400" />
                              <span>{slot.startTime} – {slot.endTime}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Unavailable</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <Link to={`/book?stylistId=${stylist.id}`} className="mt-6 w-full flex items-center justify-center py-3 gradient-brand text-white rounded-xl font-medium hover:opacity-90 transition-opacity text-sm">
                  Book an Appointment
                </Link>
              </div>
            )}

            {tab === 'reviews' && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-semibold text-neutral-900 mb-5">Customer Reviews</h3>
                {!reviews?.length ? (
                  <p className="text-neutral-400 text-sm text-center py-8">No reviews yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="pb-4 border-b border-neutral-100 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {review.customer.name[0]}
                            </div>
                            <span className="text-sm font-medium text-neutral-800">{review.customer.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={13} className={i < review.rating ? 'text-gold-400 fill-gold-400' : 'text-neutral-200'} />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm text-neutral-600 ml-10">{review.comment}</p>}
                        <p className="text-xs text-neutral-300 ml-10 mt-1">{format(new Date(review.createdAt), 'd MMM yyyy')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
