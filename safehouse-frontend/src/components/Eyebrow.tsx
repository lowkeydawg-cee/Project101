interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

// Bracketed mono eyebrow — inherited from the Safehouse brand mark, used only
// for genuine section labels, not sprinkled as decoration.
export function Eyebrow({ children, className = '' }: EyebrowProps) {
  return (
    <span className={`font-mono-label text-[11px] uppercase text-signal-soft ${className}`}>
      [ {children} ]
    </span>
  )
}
