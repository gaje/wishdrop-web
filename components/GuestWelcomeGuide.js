'use client'

import { useState, useEffect, useCallback } from 'react'

// ---------------------------------------------------------------------------
// SVG Icon Components
// ---------------------------------------------------------------------------

function SearchIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function BagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function CheckCircleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  )
}

function InfoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CloseIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

function GiftIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Step data
// ---------------------------------------------------------------------------

const STEPS = [
  {
    icon: SearchIcon,
    title: 'Browse',
    description: 'Look through the items and pick something you\'d like to gift.',
    accent: 'from-brand-400/20 to-brand-500/10',
    iconColor: 'text-brand-600',
    ring: 'ring-brand-200',
  },
  {
    icon: BagIcon,
    title: 'Purchase',
    description: 'Tap "Buy" to visit the store and purchase there directly. Some items may not have a link if they were spotted in a physical store.',
    accent: 'from-violet-400/20 to-violet-500/10',
    iconColor: 'text-violet-600',
    ring: 'ring-violet-200',
  },
  {
    icon: CheckCircleIcon,
    title: 'Claim',
    description: 'After buying, come back and tap "Claim This" so nobody else buys the same thing.',
    accent: 'from-emerald-400/20 to-emerald-500/10',
    iconColor: 'text-emerald-600',
    ring: 'ring-emerald-200',
  },
]

// ---------------------------------------------------------------------------
// Inline collapsed bar (always rendered to reserve layout space)
// ---------------------------------------------------------------------------

function CollapsedBar({ onClick, visible }) {
  return (
    <button
      onClick={onClick}
      aria-expanded={false}
      aria-label="How does gifting work? Tap to learn more."
      className={`
        group w-full flex items-center gap-2.5 px-4 py-2.5
        bg-white/60 backdrop-blur-sm
        border border-slate-200/80
        rounded-xl
        text-sm font-medium text-slate-500
        hover:bg-white/80 hover:border-slate-300 hover:text-slate-700
        transition-all duration-300 ease-smooth
        ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <InfoIcon className="w-4 h-4 text-slate-400 group-hover:text-brand-500 transition-colors duration-300" />
      <span className="flex-1 text-left">How does gifting work?</span>
      <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-500 transition-colors duration-300" />
    </button>
  )
}

// ---------------------------------------------------------------------------
// SSR-safe skeleton placeholder (matches collapsed bar dimensions)
// ---------------------------------------------------------------------------

function CollapsedSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="
        w-full flex items-center gap-2.5 px-4 py-2.5
        bg-slate-100/50
        border border-slate-200/40
        rounded-xl
        animate-pulse
      "
    >
      <div className="w-4 h-4 rounded-full bg-slate-200" />
      <div className="flex-1 h-4 rounded bg-slate-200/70" />
      <div className="w-3.5 h-3.5 rounded bg-slate-200/50" />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Full guide overlay (first visit)
// ---------------------------------------------------------------------------

function GuideOverlay({ username, onDismiss, visible }) {
  // Close on Escape key
  useEffect(() => {
    if (!visible) return
    const handler = (e) => {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible, onDismiss])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm
          transition-opacity duration-500 ease-smooth
          ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Welcome guide"
        className={`
          fixed z-50 inset-0 flex items-center justify-center p-4
          transition-all duration-500 ease-smooth
          ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div
          className={`
            relative w-full max-w-md
            bg-white/90 backdrop-blur-xl
            border border-white/50
            rounded-2xl
            shadow-elevation-4
            overflow-hidden
            transition-all duration-500 ease-smooth
            ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle gradient accent at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-400 via-violet-400 to-emerald-400" />

          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
            aria-label="Close guide"
          >
            <CloseIcon className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="p-6 pt-7">
            {/* Header */}
            <div className="flex items-start gap-3 mb-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                <GiftIcon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800 leading-tight">
                  Welcome to {username}&apos;s wishlist
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Here&apos;s how gifting works
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex items-start gap-3.5">
                  {/* Step number + icon */}
                  <div className="flex-shrink-0 relative">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${step.accent} ring-1 ${step.ring} flex items-center justify-center`}>
                      <step.icon className={`w-4 h-4 ${step.iconColor}`} />
                    </div>
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {i + 1}
                    </span>
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-3 bg-slate-200" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="pt-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 leading-tight">
                      {step.title}
                    </p>
                    <p className="text-[13px] text-slate-500 leading-snug mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={onDismiss}
              className="
                mt-6 w-full py-2.5 px-4
                bg-slate-800 text-white text-sm font-semibold
                rounded-xl
                hover:bg-slate-700
                active:scale-[0.98]
                transition-all duration-200
              "
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Inline expanded panel (for return visitors who click the collapsed bar)
// ---------------------------------------------------------------------------

function InlinePanel({ username, onClose, expanded }) {
  return (
    <div
      className={`
        overflow-hidden
        transition-all duration-400 ease-smooth
        ${expanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}
      `}
    >
      <div className="bg-white/70 backdrop-blur-sm border border-slate-200/80 rounded-xl p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
              <GiftIcon className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              How gifting works
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Steps - horizontal on wider screens, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex sm:flex-col items-start gap-2.5 sm:gap-2">
              <div className="flex-shrink-0 relative">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br ${step.accent} ring-1 ${step.ring} flex items-center justify-center`}>
                  <step.icon className={`w-4 h-4 ${step.iconColor}`} />
                </div>
                <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                  {i + 1}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700">{step.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function GuestWelcomeGuide({ username }) {
  const [mounted, setMounted] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [inlineExpanded, setInlineExpanded] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem('wishdrop_guide_dismissed') === 'true'
    setIsFirstVisit(!wasDismissed)
    if (!wasDismissed) {
      // Small delay so the page renders first, then the overlay animates in
      requestAnimationFrame(() => {
        setShowOverlay(true)
      })
    }
    setMounted(true)
  }, [])

  const handleOverlayDismiss = useCallback(() => {
    localStorage.setItem('wishdrop_guide_dismissed', 'true')
    setShowOverlay(false)
    setIsFirstVisit(false)
  }, [])

  const handleBarClick = useCallback(() => {
    setInlineExpanded(true)
  }, [])

  const handleInlineClose = useCallback(() => {
    setInlineExpanded(false)
  }, [])

  // Collapsed bar is always present in the DOM to reserve space.
  // Before mount, show a skeleton. After mount, show the real bar or nothing
  // if the overlay is active (first visit).
  const showBar = mounted && !isFirstVisit && !inlineExpanded

  return (
    <div className="mb-6">
      {/* Skeleton placeholder before hydration - avoids layout shift */}
      {!mounted && <CollapsedSkeleton />}

      {/* Collapsed bar for return visitors */}
      {mounted && !isFirstVisit && (
        <>
          <CollapsedBar onClick={handleBarClick} visible={showBar} />
          <InlinePanel
            username={username}
            onClose={handleInlineClose}
            expanded={inlineExpanded}
          />
        </>
      )}

      {/* First-visit overlay (renders in a portal-like fixed position) */}
      {mounted && isFirstVisit && (
        <>
          {/* Reserve the bar space even during first visit */}
          <CollapsedBar onClick={() => {}} visible={false} />
          <GuideOverlay
            username={username}
            onDismiss={handleOverlayDismiss}
            visible={showOverlay}
          />
        </>
      )}
    </div>
  )
}
