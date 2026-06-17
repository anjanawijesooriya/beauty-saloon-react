import { lazy, Suspense } from 'react'
import { useBookingStore } from '@/store/booking'
import { AnimatePresence, motion } from 'framer-motion'
import { slideInRight } from '@/lib/motion'

const Step1Services = lazy(() => import('@/components/booking/Step1Services'))
const Step2Stylist  = lazy(() => import('@/components/booking/Step2Stylist'))
const Step3DateTime = lazy(() => import('@/components/booking/Step3DateTime'))
const Step4Confirm  = lazy(() => import('@/components/booking/Step4Confirm'))

const steps = ['Service', 'Stylist', 'Date & Time', 'Confirm']

const stepComponents = [Step1Services, Step2Stylist, Step3DateTime, Step4Confirm]

function StepFallback() {
  return <div className="min-h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin" /></div>
}

export default function BookPage() {
  const { step } = useBookingStore()
  const StepComponent = stepComponents[step - 1]

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl italic text-neutral-900 mb-8">Book Appointment</h1>

      {/* Step indicators */}
      <div className="flex items-center mb-10">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i + 1 < step ? 'gradient-brand text-white' :
              i + 1 === step ? 'ring-2 ring-brand-400 text-brand-500 bg-white' :
              'bg-neutral-100 text-neutral-400'
            }`}>
              {i + 1 < step ? (
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : i + 1}
            </div>
            <span className={`ml-2 text-xs font-medium whitespace-nowrap ${i + 1 === step ? 'text-brand-500' : i + 1 < step ? 'text-brand-400' : 'text-neutral-400'}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-all ${i + 1 < step ? 'bg-brand-400' : 'bg-neutral-200'}`} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} variants={slideInRight} initial="hidden" animate="visible" exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}>
          <div className="bg-white rounded-2xl shadow-card p-8">
            <Suspense fallback={<StepFallback />}>
              <StepComponent />
            </Suspense>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
