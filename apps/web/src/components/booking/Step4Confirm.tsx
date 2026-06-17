import { format } from 'date-fns'
import { User, Clock, Calendar, Scissors, StickyNote } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useBookingStore } from '@/store/booking'
import { useCreateAppointment } from '@/hooks/useAppointments'

export default function Step4Confirm() {
  const navigate = useNavigate()
  const {
    selectedServices, selectedStylist, selectedDate, selectedTime,
    notes, setNotes, setStep, totalDurationMins, totalLKR, reset,
  } = useBookingStore()

  const { mutate: create, isPending } = useCreateAppointment()

  const buildStartsAt = () => {
    if (!selectedDate || !selectedTime) return ''
    const [h, m] = selectedTime.split(':').map(Number)
    const d = new Date(selectedDate)
    d.setHours(h, m, 0, 0)
    return d.toISOString()
  }

  const handleBook = () => {
    if (!selectedStylist || !selectedDate || !selectedTime) return
    create(
      {
        stylistId: selectedStylist.id,
        serviceIds: selectedServices.map((s) => s.id),
        startsAt: buildStartsAt(),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          reset()
          navigate('/booking/success')
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Failed to book appointment')
        },
      },
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-1">Confirm Booking</h2>
      <p className="text-sm text-neutral-500 mb-6">Review your details before confirming.</p>

      <div className="space-y-4">
        {/* Services */}
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100">
          <p className="text-xs font-medium text-neutral-400 flex items-center gap-1.5 mb-3"><Scissors size={12} /> Services</p>
          <div className="space-y-2">
            {selectedServices.map((s) => (
              <div key={s.id} className="flex justify-between items-center">
                <span className="text-sm text-neutral-800">{s.name}</span>
                <span className="text-sm font-medium text-neutral-600">LKR {Number(s.basePriceLKR).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between">
            <span className="text-xs text-neutral-400 flex items-center gap-1"><Clock size={10} /> {totalDurationMins()} min total</span>
            <span className="text-sm font-bold text-neutral-900">LKR {totalLKR().toLocaleString()}</span>
          </div>
        </div>

        {/* Stylist */}
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3">
          <p className="text-xs font-medium text-neutral-400 w-20 flex items-center gap-1.5 flex-shrink-0"><User size={12} /> Stylist</p>
          <p className="text-sm text-neutral-800">{selectedStylist?.user.name}</p>
        </div>

        {/* Date & Time */}
        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3">
          <p className="text-xs font-medium text-neutral-400 w-20 flex items-center gap-1.5 flex-shrink-0"><Calendar size={12} /> Date</p>
          <p className="text-sm text-neutral-800">
            {selectedDate && format(selectedDate, 'EEEE, d MMMM yyyy')} at <span className="font-medium">{selectedTime}</span>
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-medium text-neutral-500 flex items-center gap-1.5 mb-2"><StickyNote size={12} /> Add a note (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Any special requests or information for your stylist..."
            className="w-full px-4 py-3 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
          />
          <p className="text-xs text-neutral-300 text-right mt-1">{notes.length}/500</p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={() => setStep(3)} className="px-6 py-3 border border-neutral-200 text-neutral-600 rounded-xl text-sm hover:bg-neutral-50 transition-colors">
          ← Back
        </button>
        <button
          onClick={handleBook}
          disabled={isPending}
          className="px-8 py-3 gradient-brand text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
        >
          {isPending ? (
            <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Booking...</>
          ) : (
            'Confirm Appointment'
          )}
        </button>
      </div>
    </div>
  )
}
