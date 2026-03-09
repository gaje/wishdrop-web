'use client'

/**
 * ProductImageFallback — Glassmorphic premium placeholder
 * Shown when a product image is missing, broken, or bot-blocked.
 *
 * Visual: Tri-color gradient background with floating blobs,
 * frosted glass card, cyan icon, shimmer animation.
 */
export default function ProductImageFallback({ className = '' }) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 50%, #fce7f3 100%)' }}
    >
      {/* Floating gradient blobs */}
      <div
        className="absolute animate-blob-drift-1"
        style={{
          width: '140%', height: '140%', top: '-30%', left: '-20%',
          background: 'radial-gradient(circle, rgba(0,202,255,0.2) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute animate-blob-drift-2"
        style={{
          width: '120%', height: '120%', bottom: '-40%', right: '-30%',
          background: 'radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 60%)',
        }}
      />

      {/* Frosted glass card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative overflow-hidden flex flex-col items-center gap-2 px-4 py-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            width: '70%',
          }}
        >
          {/* Shimmer */}
          <div
            className="absolute inset-0 animate-shimmer-sweep"
            style={{
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
            }}
          />

          {/* Logo */}
          <img
            src="/logo-w.png"
            alt="Wishdrop"
            className="w-10 opacity-60 object-contain"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,202,255,0.25))' }}
          />

          <span className="text-xs font-semibold text-slate-500 relative z-10">Image unavailable</span>
          <span className="text-[10px] text-slate-400 relative z-10">Tap to view on store</span>
        </div>
      </div>
    </div>
  )
}
