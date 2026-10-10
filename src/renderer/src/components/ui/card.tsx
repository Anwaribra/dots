import React from 'react'

export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={`mb-4 flex flex-col space-y-1.5 ${className}`} {...props}>{children}</div>
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>): JSX.Element {
  return <h3 className={`text-lg font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-100 ${className}`} {...props}>{children}</h3>
}

export function CardDescription({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>): JSX.Element {
  return <p className={`text-sm text-slate-500 dark:text-slate-400 ${className}`} {...props}>{children}</p>
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={className} {...props}>{children}</div>
}

export function CardFooter({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={`mt-4 flex items-center pt-2 ${className}`} {...props}>{children}</div>
}
