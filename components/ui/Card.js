'use client'

/**
 * Card Component
 * Reusable card container with optional hover effects
 */
export default function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  ...props
}) {
  const baseStyles = 'bg-white rounded-2xl transition-all duration-200'

  const variants = {
    default: 'shadow-md',
    flat: 'border border-gray-200',
    elevated: 'shadow-lg',
    ghost: '',
  }

  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : ''

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const clickableProps = onClick ? { onClick, role: 'button', tabIndex: 0 } : {}

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${paddings[padding]} ${className}`}
      {...clickableProps}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardHeader - Optional header section
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-3 border-b border-gray-100 mb-3 ${className}`}>
      {children}
    </div>
  )
}

/**
 * CardTitle - Card heading
 */
export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  )
}

/**
 * CardDescription - Subtitle or description
 */
export function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-sm text-gray-500 mt-1 ${className}`}>
      {children}
    </p>
  )
}

/**
 * CardContent - Main content area
 */
export function CardContent({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

/**
 * CardFooter - Footer with actions
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-3 border-t border-gray-100 mt-3 ${className}`}>
      {children}
    </div>
  )
}
