import { useEffect, useState } from 'react'
import { MoonStar, SunMedium } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem('safehouse-theme')

    if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark')
      setDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setDark(true)
    }
  }, [])

  function toggleTheme() {
    const nextDark = !dark

    setDark(nextDark)

    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('safehouse-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('safehouse-theme', 'light')
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex h-9 w-9 items-center justify-center border border-hairline text-ink transition-colors hover:bg-panel-raised"
    >
      {dark ? (
        <SunMedium size={16} strokeWidth={1.7} />
      ) : (
        <MoonStar size={16} strokeWidth={1.7} />
      )}
    </button>
  )
}