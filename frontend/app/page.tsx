'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { HeroSection } from '@/components/hero-section'
import { CategoriesSection } from '@/components/categories-section'
import { FeaturesSection } from '@/components/features-section'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/AuthModal'

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

export default function Home() {
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <Navigation onLoginClick={() => setAuthOpen(true)} />

      {/* Auth Modal — rendered at top level so it overlays everything */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <HeroSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <CategoriesSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <FeaturesSection />
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={sectionVariants}
      >
        <Footer />
      </motion.div>
    </main>
  )
}
