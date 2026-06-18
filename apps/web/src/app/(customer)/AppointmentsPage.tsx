import { useState } from 'react'
import { format } from 'date-fns'
import { Star, X, CalendarCheck, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppointments, useCancelAppointment } from '@/hooks/useAppointments'
import { useCreateReview } from '@/hooks/useReviews'
import type { Appointment } from '@/types'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-600 border border-amber-100',
  CONFIRMED: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  CANCELLED: 'bg-red-50 text-red-500 border border-red-100',
  COMPLETED: 'bg-blue-50 text-blue-600 border border-blue-100',
  NO_SHOW:   'bg-neutral-100 text-neutral-500 border border-neutral-200',
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <Star size={24} className={(hover || value) >= n ? 'text-gold-400 fill-gold-400' : 'text-neutral-200'} />
        </button>
      ))}
    </div>
  )
}

function ReviewModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const { mutate: submit, isPending } = useCreateReview()

  const handleSubmit = () => {
    submit({ appointmentId: appointment.id, stylistId: appointment.stylistId, rating, comment: comment || undefined }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-900">Rate your experience</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"><X size={18} /></button>
        </div>
        <p className="text-sm text-neutral-500 mb-4">How was your appointment with <strong>{appointment.stylist.user.name}</strong>?</p>
        <div className="flex justify-center mb-5">
          <StarRating value={rating} onChange={setRating} />
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="Share your experience (optional)..."
          className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-300"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={isPending || rating === 0}
            className="flex-1 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
            {isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments()
  const { mutate: cancel } = useCancelAppointment()
  const [reviewAppt, setReviewAppt] = useState<Appointment | null>(null)

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">My Appointments</h1>
      {!appointments?.length ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-5">
            <CalendarCheck size={36} className="text-brand-300" />
          </div>
          <h2 className="font-display text-2xl italic text-neutral-900 mb-2">No appointments yet</h2>
          <p className="text-neutral-400 text-sm mb-7 max-w-xs">Book your first appointment with one of our expert stylists.</p>
          <Link to="/book" className="inline-flex items-center gap-2 px-6 py-3 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            Book Now <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900">{appt.stylist.user.name}</p>
                  <p className="text-neutral-500 text-sm">{format(new Date(appt.startsAt), 'PPp')}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {appt.items.map((item) => (
                      <span key={item.id} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-pill">{item.service.name}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-pill ${STATUS_COLORS[appt.status]}`}>{appt.status}</span>
                  <span className="font-semibold text-brand-500 text-sm">LKR {Number(appt.totalLKR).toLocaleString()}</span>
                  {appt.status === 'PENDING' && (
                    <button onClick={() => cancel({ id: appt.id })} className="text-xs text-red-400 hover:underline">Cancel</button>
                  )}
                  {appt.status === 'COMPLETED' && !(appt as any).review && (
                    <button
                      onClick={() => setReviewAppt(appt)}
                      className="flex items-center gap-1 text-xs text-gold-500 hover:text-gold-600 transition-colors font-medium"
                    >
                      <Star size={12} className="fill-gold-400" /> Leave a Review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewAppt && <ReviewModal appointment={reviewAppt} onClose={() => setReviewAppt(null)} />}
    </div>
  )
}
