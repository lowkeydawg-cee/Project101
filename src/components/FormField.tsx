import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react'

const fieldClass =
  'w-full rounded-lg border border-ink/20 bg-panel-raised px-4 py-3 text-sm text-ink placeholder:text-ink-dim/70 focus-visible:border-signal-soft'

interface WrapperProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function FieldWrapper({ label, htmlFor, error, hint, children }: WrapperProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="font-mono-label text-[11px] uppercase text-ink-dim">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-dim">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-signal-soft">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, id, ...props }: TextFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint}>
      <input id={id} className={fieldClass} aria-invalid={!!error} {...props} />
    </FieldWrapper>
  )
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function TextAreaField({ label, error, hint, id, ...props }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint}>
      <textarea id={id} className={`${fieldClass} min-h-32 resize-y`} aria-invalid={!!error} {...props} />
    </FieldWrapper>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  hint?: string
  options: string[]
}

export function SelectField({ label, error, hint, id, options, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={id!} error={error} hint={hint}>
      <select id={id} className={fieldClass} aria-invalid={!!error} {...props}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}
