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

          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-[10px]"
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #00CAFF, #00A8D4)',
              boxShadow: '0 2px 8px rgba(0,202,255,0.3)',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
            </svg>
          </div>

          <span className="text-xs font-semibold text-slate-500 relative z-10">Image unavailable</span>
          <span className="text-[10px] text-slate-400 relative z-10">Tap to view on store</span>
        </div>
      </div>
    </div>
  )
}
