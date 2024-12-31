'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import ThemeSwitch from './ThemeSwitch';

export default function Header() {
  const [bgColor, setBgColor] = useState('bg-pink-200/80 dark:bg-pink-900/30');
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const colors = [
      'bg-pink-200/80 dark:bg-pink-900/30',
      'bg-blue-200/80 dark:bg-blue-900/30',
      'bg-purple-200/80 dark:bg-purple-900/30',
      'bg-green-200/80 dark:bg-green-900/30'
    ];
    let currentIndex = 0;

    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % colors.length;
      setBgColor(colors[currentIndex]);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  return (
    <header className={`sticky mb-6 top-0 z-50 w-full ${bgColor} backdrop-blur-sm transition-colors duration-1000 ease-in-out w-full ${isMenuOpen ? 'h-[100dvh] md:h-auto' : ''}`}>
      <div className="relative h-full z-50 flex flex-col">
        <div className="container mx-auto py-4 flex items-center justify-between">
          <div className="w-full flex items-center gap-16 justify-between">
            <Link href="/">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                Sharath B C
              </h1>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <ThemeSwitch />
              <Link
                href="mailto:sharath.byadagodu@outlook.com"
                className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Contact Me
              </Link>
              <Link
                href="/data/resume.pdf"
                className="bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                download
              >
                Download Resume
              </Link>
            </nav>
          </div>


          <div className="md:hidden flex items-center gap-2">
            <ThemeSwitch />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <CloseIcon /> : <Hamburger />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className={`z-10 bg-white dark:bg-black ${isMenuOpen ? 'flex flex-col flex-1' : 'hidden'}`}>

            <div className="overflow-y-auto mt-4 flex-1">
              <nav className="flex flex-col gap-4">
                <Link
                  href="#contact"
                  className="text-black dark:text-white px-4 py-2 rounded-md transition-colors duration-300 border-b border-gray-200 dark:border-gray-800"
                >
                  Contact Me
                </Link>
                <Link
                  href="/data/resume.pdf"
                  className="text-black dark:text-white px-4 py-2 rounded-md transition-colors duration-300 border-b border-gray-200 dark:border-gray-800"
                  download
                >
                  Download Resume
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

const Hamburger = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 16H27" stroke="currentColor" className="dark:stroke-white stroke-black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 8H27" stroke="currentColor" className="dark:stroke-white stroke-black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 24H27" stroke="currentColor" className="dark:stroke-white stroke-black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const CloseIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 7L7 25" stroke="currentColor" className="dark:stroke-white stroke-black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 25L7 7" stroke="currentColor" className="dark:stroke-white stroke-black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)