'use client'

import { ThemeProvider } from 'next-themes'
import { MotionConfig } from 'framer-motion'
import { useState, useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // reducedMotion="user": every framer animation honors the OS setting
    const content = <MotionConfig reducedMotion="user">{children}</MotionConfig>

    if (!mounted) return content
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {content}
        </ThemeProvider>
    )
}
