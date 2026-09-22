import { type ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'disabled'

export const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-mono-label text-[11px] uppercase transition-colors duration-200 disabled:cursor-not-allowed'

export const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-signal text-ink hover:bg-signal-soft hover:text-void',
  secondary: 'border border-ink/30 text-ink hover:border-ink hover:bg-ink hover:text-void',
  ghost: 'text-ink-dim hover:text-ink underline underline-offset-4',
  disabled: 'border border-hairline bg-panel text-ink-dim',
}

export function buttonClass(variant: ButtonVariant = 'primary', className = '') {
  return `${buttonBase} ${buttonVariants[variant]} ${className}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={buttonClass(variant, className)} {...props} />
}
