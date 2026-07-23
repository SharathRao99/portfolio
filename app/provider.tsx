'use client'

import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'

/**
 * The provider tree is rendered once. It used to gate ThemeProvider behind a
 * `mounted` flag, which meant the entire app was rendered without it, then
 * re-rendered underneath it the moment hydration finished — a full second
 * pass over every component on the page. `suppressHydrationWarning` on <html>
 * (see app/layout.tsx) is the supported way to let next-themes set the class
 * before React hydrates; components that need the resolved value already
 * guard for it (e.g. ThemeSwitch).
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {/* reducedMotion="user": every framer animation honors the OS setting */}
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </ThemeProvider>
    )
}
