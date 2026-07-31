import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import {
  FaHome,
  FaArrowLeft,
  FaRocket,
  FaStar,
  FaMoon,
  FaMagic
} from 'react-icons/fa'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const NotFound = () => {
  const { t } = useLanguage()
  const canvasRef = useRef(null)

  // Rain effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight

    canvas.width = width
    canvas.height = height

    // Rain drops
    const drops = []
    const dropCount = 150

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 10 + 5,
        opacity: Math.random() * 0.5 + 0.2
      })
    }

    // Floating particles
    const particles = []
    const particleCount = 30

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 4 + 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw rain
      ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)'
      ctx.lineWidth = 1.5

      for (const drop of drops) {
        ctx.beginPath()
        ctx.moveTo(drop.x, drop.y)
        ctx.lineTo(drop.x - 2, drop.y + drop.length)
        ctx.strokeStyle = `rgba(100, 149, 237, ${drop.opacity})`
        ctx.stroke()

        drop.y += drop.speed

        if (drop.y > height) {
          drop.y = -drop.length
          drop.x = Math.random() * width
        }
      }

      // Draw particles
      for (const particle of particles) {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(100, 149, 237, ${particle.opacity})`
        ctx.fill()

        particle.x += particle.speedX
        particle.y += particle.speedY

        if (particle.x < 0 || particle.x > width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > height) particle.speedY *= -1
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-blue-950">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Glow effect behind 404 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />

      {/* Main content */}
      <div className="relative z-10 max-w-md mx-auto text-center px-4">
        {/* Animated 404 number */}
        <div className="relative">
          <motion.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-8xl md:text-9xl font-extrabold text-white select-none"
          >
            4
            <span className="text-brand-primary inline-block animate-bounce">0</span>
            4
          </motion.h1>

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-1 bg-gradient-to-r from-transparent via-brand-primary to-transparent mx-auto rounded-full"
            style={{ width: '200px' }}
          />
        </div>

        {/* Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-white mt-6"
        >
          {t('notFound.title') || 'Oops! Trang không tồn tại'}
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-gray-400 mt-3 text-base md:text-lg leading-relaxed"
        >
          {t('notFound.description') || 'Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.'}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-brand text-white rounded-xl font-semibold hover:shadow-glow transition-all duration-300 group"
            >
              <FaHome size={18} className="group-hover:rotate-12 transition-transform duration-300" />
              {t('notFound.backHome') || 'Về trang chủ'}
              <FaRocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/40 transition-all duration-300 group cursor-pointer"
            >
              <FaArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
              {t('notFound.goBack') || 'Quay lại'}
            </button>
          </motion.div>
        </motion.div>

        {/* Floating decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 flex items-center justify-center gap-3 text-gray-500"
        >
          <motion.span
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <FaStar size={16} className="text-yellow-400/60" />
          </motion.span>
          <span className="text-gray-600">•</span>
          <motion.span
            animate={{
              y: [0, -5, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <FaMoon size={18} className="text-blue-300/60" />
          </motion.span>
          <span className="text-gray-600">•</span>
          <motion.span
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
          >
            <FaMagic size={16} className="text-purple-400/60" />
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound