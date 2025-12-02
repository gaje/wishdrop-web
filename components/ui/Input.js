'use client'

import { useState } from 'react'

/**
 * Input Component
 * Reusable text input with label, error state, and icon support
 */
export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  className = '',
  inputClassName = '',
  ...props
}) {
  const [focused, setFocused] = useState(false)

  const baseInputStyles = 'w-full px-4 py-3 rounded-xl border outline-none transition-all duration-200'

  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
    : 'border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'

  const disabledStyles = disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'

  const iconPadding = icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : ''

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${baseInputStyles} ${stateStyles} ${disabledStyles} ${iconPadding} ${inputClassName}`}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-1.5 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}
