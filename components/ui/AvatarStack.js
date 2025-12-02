'use client'

/**
 * AvatarStack - Shows overlapping avatars for a list of users
 *
 * @param {Array} users - Array of user objects with { _id, displayName, username, avatar }
 * @param {number} max - Maximum number of avatars to show (default: 3)
 * @param {string} size - Size: 'sm', 'md', 'lg' (default: 'sm')
 */
export default function AvatarStack({
  users = [],
  max = 3,
  size = 'sm',
  className = '',
}) {
  if (!users || users.length === 0) return null

  const visibleUsers = users.slice(0, max)
  const overflow = users.length - max

  const sizes = {
    sm: { container: 'h-6', avatar: 'w-6 h-6 text-xs', overlap: '-ml-2' },
    md: { container: 'h-8', avatar: 'w-8 h-8 text-sm', overlap: '-ml-2.5' },
    lg: { container: 'h-10', avatar: 'w-10 h-10 text-base', overlap: '-ml-3' },
  }

  const sizeConfig = sizes[size] || sizes.sm

  // Generate initials from name
  const getInitials = (user) => {
    const name = user?.displayName || user?.username || ''
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }

  // Generate a consistent color based on name
  const getColor = (name) => {
    if (!name) return 'bg-gray-400'
    const colors = [
      'bg-cyan-500',
      'bg-teal-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-rose-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-emerald-500',
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex ${sizeConfig.container}`}>
        {visibleUsers.map((user, index) => (
          <div
            key={user._id || index}
            className={`${sizeConfig.avatar} rounded-full ring-2 ring-white flex items-center justify-center overflow-hidden ${
              index === 0 ? '' : sizeConfig.overlap
            }`}
            style={{ zIndex: visibleUsers.length - index }}
            title={user.displayName || user.username}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName || user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className={`w-full h-full ${getColor(user.displayName || user.username)} flex items-center justify-center text-white font-semibold`}
              >
                {getInitials(user)}
              </div>
            )}
          </div>
        ))}

        {/* Overflow indicator */}
        {overflow > 0 && (
          <div
            className={`${sizeConfig.avatar} ${sizeConfig.overlap} rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-slate-600 font-semibold`}
            style={{ zIndex: 0 }}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}
