import { MoonStar, SunMedium } from 'lucide-react'
import { setTheme, useUi } from '@/lib/uiStyle'

export function ThemeToggle() {
  const { theme } = useUi()
  const dark = theme === 'dark'
  const label = dark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className="sh-btn flex h-9 w-9 items-center justify-center border border-hairline text-ink transition-colors hover:bg-panel-raised"
    >
      {dark ? <SunMedium size={16} strokeWidth={1.7} /> : <MoonStar size={16} strokeWidth={1.7} />}
    </button>
  )
}
