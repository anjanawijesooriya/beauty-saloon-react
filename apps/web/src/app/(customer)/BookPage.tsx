import { useBookingStore } from '@/store/booking'
import { AnimatePresence, motion } from 'framer-motion'
import { slideInRight } from '@/lib/motion'

const steps = ['Service', 'Stylist', 'Date & Time', 'Confirm']

export default function BookPage() {
  const { step } = useBookingStore()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">Book Appointment</h1>

      {/* Step indicators */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i + 1 <= step ? 'gradient-brand text-white' : 'bg-neutral-100 text-neutral-400'}`}>
              {i + 1}
            </div>
            <span className={`ml-2 text-sm ${i + 1 === step ? 'text-brand-500 font-medium' : 'text-neutral-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? 'bg-brand-400' : 'bg-neutral-200'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} variants={slideInRight} initial="hidden" animate="visible">
          <div className="bg-white rounded-2xl shadow-card p-8 min-h-64 flex items-center justify-center text-neutral-400">
            Step {step}: {steps[step - 1]} — coming in Phase 1 implementation
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
