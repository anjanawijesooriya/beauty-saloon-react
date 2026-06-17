import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { staggerContainer, fadeUp } from '@/lib/motion'

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero min-h-[90vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.p variants={fadeUp} className="text-brand-400 font-medium tracking-widest uppercase text-sm">
              Sri Lanka's Premier Beauty Platform
            </motion.p>
            <motion.h1 variants={fadeUp} className="font-display text-6xl italic text-neutral-900 mt-2 leading-tight">
              Look Beautiful,<br />Feel Confident
            </motion.h1>
            <motion.p variants={fadeUp} className="text-neutral-600 text-lg mt-4 max-w-md">
              Book top-rated stylists near you. Hair, skin, nails, and beyond.
            </motion.p>
            <motion.div variants={fadeUp} className="flex gap-3 mt-8">
              <Link to="/book" className="px-8 py-3 text-white gradient-brand rounded-pill font-medium hover:opacity-90 transition-opacity">
                Book Now
              </Link>
              <Link to="/services" className="px-8 py-3 border border-brand-400 text-brand-400 rounded-pill font-medium hover:bg-brand-50 transition-colors">
                Explore Services
              </Link>
            </motion.div>
          </motion.div>
          <div className="hidden lg:block">
            <div className="aspect-square rounded-2xl gradient-brand opacity-20" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="font-display text-4xl italic text-center text-neutral-900 mb-10">Browse by Category</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {['Hair', 'Skin', 'Nails', 'Makeup', 'Spa'].map((cat) => (
            <Link
              key={cat}
              to={`/services?category=${cat.toLowerCase()}`}
              className="flex-shrink-0 px-6 py-3 bg-brand-50 rounded-pill text-brand-700 font-medium hover:bg-brand-100 transition-colors"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="gradient-brand text-white py-16 text-center">
        <h2 className="font-display text-4xl italic mb-4">Book Your First Appointment</h2>
        <p className="text-white/80 mb-8">Join thousands of happy customers across Sri Lanka</p>
        <Link to="/register" className="px-10 py-3 bg-white text-brand-500 rounded-pill font-semibold hover:bg-brand-50 transition-colors">
          Get Started Free
        </Link>
      </section>
    </div>
  )
}
