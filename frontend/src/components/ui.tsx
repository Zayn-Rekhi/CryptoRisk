import React from 'react'

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4">{children}</div>
}

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-gray-200 bg-white shadow-card',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
  const styles =
    variant === 'primary'
      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm px-4 py-2'
      : variant === 'secondary'
        ? 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 px-4 py-2'
        : 'bg-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-2'
  return (
    <button className={[base, styles, className].join(' ')} {...props}>
      {children}
    </button>
  )
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={[
        'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm',
        'placeholder:text-gray-400',
        'focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 outline-none transition',
        className,
      ].join(' ')}
      {...props}
    />
  )
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-700">
      {children}
    </label>
  )
}

export function Divider({ label }: { label?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      {label ? (
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-gray-500 font-semibold tracking-wide">
            {label}
          </span>
        </div>
      ) : null}
    </div>
  )
}

