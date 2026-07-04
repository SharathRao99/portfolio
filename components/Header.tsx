'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import ThemeSwitch from './ThemeSwitch'
import { navData, personalInfo } from '@/lib/data'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Skills', href: '/skills' },
  { label: 'Projects', href: '/projects' },
]

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 24)
  })

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  // close the overlay when navigating
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.1 }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <div
          className={`flex w-full max-w-[1200px] items-center justify-between rounded-2xl px-4 py-3 transition-all duration-500 md:px-6 ${
            scrolled ? 'glass-strong shadow-card-float' : 'border border-transparent'
          }`}
        >
          <Link href="/" className="group relative z-10">
            <span className="text-lg font-bold tracking-tight md:text-xl">
              {personalInfo.name.split(' ')[0]}
              <span className="text-gradient">
                {' '}{personalInfo.name.split(' ').slice(1).join(' ')}
              </span>
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    active ? 'text-foreground' : 'text-muted hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      className="absolute inset-0 rounded-full glass-light"
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeSwitch />
            <Link
              href={personalInfo.contactLink}
              className="link-underline text-sm font-medium text-muted transition-colors duration-300 hover:text-foreground"
            >
              {navData.contactText}
            </Link>
            <Link
              href={personalInfo.resumeLink}
              target="_blank"
              download
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition-shadow duration-300 hover:shadow-glow"
            >
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.35)_50%,transparent_75%)] bg-[length:250%_100%] animate-shimmer" aria-hidden />
              <span className="relative z-10">Resume</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <ThemeSwitch />
            <button
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative z-[70] flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full glass-light"
            >
              <motion.span
                animate={isMenuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                className="block h-[2px] w-5 bg-current"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-[2px] w-5 bg-current"
              />
              <motion.span
                animate={isMenuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                className="block h-[2px] w-5 bg-current"
              />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-background/95 px-8 pb-12 pt-32 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 180, damping: 22 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block py-2 text-4xl font-bold tracking-tight transition-colors ${
                      pathname === link.href ? 'text-gradient' : 'text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-col gap-4"
            >
              <Link
                href={personalInfo.contactLink}
                className="text-lg font-medium text-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {navData.contactText} ↗
              </Link>
              <Link
                href={personalInfo.resumeLink}
                target="_blank"
                download
                className="w-max rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 px-6 py-3 font-semibold text-white shadow-glow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                {navData.downloadResumeText}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
