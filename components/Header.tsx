'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from 'framer-motion'
import ThemeSwitch from './ThemeSwitch'
import { openPalette } from './CommandPalette'
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

  // Lock page scroll while the menu is open. Lock <html> as well as <body>
  // (iOS Safari ignores body-only locks) and restore with '' rather than
  // 'unset': 'unset' overrides the stylesheet and wiped body's overflow-x: clip.
  useEffect(() => {
    if (!isMenuOpen) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    return () => {
      root.style.overflow = ''
      document.body.style.overflow = ''
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
        className="fixed inset-x-0 top-0 z-[87] flex justify-center px-4 pt-4"
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
            <button
              onClick={openPalette}
              aria-label="Open command palette"
              className="glass-light flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors duration-300 hover:text-foreground"
            >
              <span>⌘</span>K
            </button>
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
            <button
              onClick={openPalette}
              aria-label="Open command palette"
              className="glass-light flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs text-muted"
            >
              &gt;_
            </button>
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
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            // z-[86]: above the floating back-to-top button (z-85) so it can't
            // sit on top of the menu, but *below* the header (z-[87]) so the
            // close toggle stays visible and clickable.
            // Opaque and no backdrop-blur/opacity: combining those with an
            // animated clip-path flickers on iOS Safari and let the page text
            // show through mid-animation.
            className="fixed inset-0 z-[86] flex flex-col justify-between overscroll-contain bg-background px-8 pb-12 pt-32 md:hidden"
          >
            <nav className="flex flex-col gap-1">
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
                    className={`block py-1 text-xl font-bold tracking-tight transition-colors ${
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
