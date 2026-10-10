import React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'critical' | 'high' | 'medium' | 'low' | 'active' | 'completed'
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps): JSX.Element {
  const baseStyle = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'

  const variants = {
    default: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    secondary: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    outline: 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    medium: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
    active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    completed: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
  }

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}
