'use client'

import Button from './Button'

/**
 * EmptyState Component
 * Placeholder for empty lists, search results, etc.
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-300">
          {typeof icon === 'string' ? (
            <span className="text-5xl">{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-gray-500 max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
