import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-brand-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4 overflow-hidden relative">

      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-[10%] w-72 h-72 bg-brand-200/30 rounded-full blur-3xl animate-blob-drift-1" />
        <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl animate-blob-drift-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-100/20 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      {/* Floating sparkles / tiny stars scattered around */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Sparkle 1 */}
        <div className="absolute top-[15%] left-[20%] animate-float" style={{ animationDelay: '0s' }}>
          <div className="w-1.5 h-1.5 bg-brand-400 rounded-full opacity-60 animate-pulse-soft" />
        </div>
        {/* Sparkle 2 */}
        <div className="absolute top-[25%] right-[25%] animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="w-2 h-2 bg-accent-violet/50 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
        </div>
        {/* Sparkle 3 */}
        <div className="absolute bottom-[30%] left-[15%] animate-float" style={{ animationDelay: '3s' }}>
          <div className="w-1 h-1 bg-brand-500 rounded-full opacity-40 animate-pulse-soft" style={{ animationDelay: '1s' }} />
        </div>
        {/* Sparkle 4 */}
        <div className="absolute top-[40%] right-[12%] animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-1.5 h-1.5 bg-accent-fuchsia/40 rounded-full animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
        </div>
        {/* Sparkle 5 */}
        <div className="absolute bottom-[20%] right-[30%] animate-float" style={{ animationDelay: '4s' }}>
          <div className="w-1 h-1 bg-brand-300 rounded-full opacity-50 animate-pulse-soft" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-lg w-full animate-fade-in-up">

        {/* CSS illustration: An open gift box with nothing inside */}
        <div className="relative mx-auto mb-8 w-56 h-56 flex items-center justify-center">

          {/* Box lid — floating just above the box */}
          <div className="absolute top-16 animate-float" style={{ animationDuration: '5s' }}>
            <div className="relative">
              {/* Lid top face */}
              <div className="w-28 h-6 bg-gradient-to-r from-brand-400 to-brand-500 rounded-t-lg mx-auto shadow-glow" />
              {/* Lid ribbon vertical */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-accent-rose/80 rounded-t-sm" />
              {/* Bow */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-end gap-0">
                <div className="w-5 h-5 border-2 border-accent-rose/80 rounded-full bg-accent-rose/20 -mr-1" />
                <div className="w-5 h-5 border-2 border-accent-rose/80 rounded-full bg-accent-rose/20 -ml-1" />
              </div>
              {/* Bow center knot */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-accent-rose/80 rounded-full" />
            </div>
          </div>

          {/* Box body */}
          <div className="absolute bottom-8">
            <div className="relative">
              {/* Box front face */}
              <div className="w-24 h-20 bg-gradient-to-b from-brand-500 to-brand-600 rounded-b-lg mx-auto shadow-elevation-3 border border-brand-400/30">
                {/* Ribbon stripe */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-full bg-accent-rose/70" />
              </div>

              {/* Question marks floating out of the empty box */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                <span className="text-5xl animate-float text-brand-400/50 font-light" style={{ animationDelay: '0.5s', animationDuration: '4s' }}>?</span>
              </div>
              <div className="absolute -top-16 left-[20%]">
                <span className="text-4xl animate-float text-brand-300/40 font-light" style={{ animationDelay: '1.5s', animationDuration: '5s' }}>?</span>
              </div>
              <div className="absolute -top-14 right-[15%]">
                <span className="text-3xl animate-float text-accent-violet/35 font-light" style={{ animationDelay: '2.5s', animationDuration: '4.5s' }}>?</span>
              </div>
            </div>
          </div>

          {/* Scattered confetti pieces around the box */}
          {/* Bottom cluster */}
          <div className="absolute bottom-4 left-6 w-2.5 h-2.5 bg-accent-amber/50 rounded-sm rotate-45 animate-pulse-soft" />
          <div className="absolute bottom-6 right-8 w-2 h-4 bg-accent-violet/40 rounded-full rotate-12" />
          <div className="absolute bottom-3 left-14 w-4 h-1.5 bg-accent-rose/40 rounded-full -rotate-12" />
          <div className="absolute bottom-5 right-14 w-2 h-2 bg-accent-emerald/40 rounded-full" />
          <div className="absolute bottom-2 left-1/2 w-3 h-1.5 bg-brand-300/50 rounded-full rotate-45" />
          {/* Left side */}
          <div className="absolute bottom-10 left-4 w-1.5 h-3 bg-accent-fuchsia/35 rounded-full -rotate-[30deg]" />
          <div className="absolute bottom-14 left-10 w-2.5 h-1 bg-accent-amber/35 rounded-full rotate-[60deg]" />
          <div className="absolute bottom-8 left-2 w-2 h-2 bg-brand-400/30 rounded-sm rotate-[15deg]" />
          {/* Right side */}
          <div className="absolute bottom-12 right-4 w-3 h-1 bg-accent-rose/35 rounded-full rotate-[40deg]" />
          <div className="absolute bottom-8 right-6 w-2 h-2.5 bg-brand-300/35 rounded-sm -rotate-[20deg]" />
          <div className="absolute bottom-14 right-12 w-1.5 h-1.5 bg-accent-emerald/30 rounded-full" />
          {/* Upper scattered */}
          <div className="absolute top-[40%] left-2 w-2 h-1 bg-accent-violet/25 rounded-full rotate-[70deg]" />
          <div className="absolute top-[35%] right-3 w-1.5 h-2.5 bg-accent-amber/25 rounded-full -rotate-[50deg]" />
        </div>

        {/* 404 number */}
        <div className="mb-3">
          <span className="text-8xl font-extrabold bg-gradient-to-r from-brand-400 via-brand-500 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            404
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          This wish got lost
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 mb-10 max-w-sm mx-auto leading-relaxed">
          We unwrapped this page but found nothing inside.
          <br className="hidden sm:block" />
          {' '}The wish you are looking for may have been moved or never existed.
        </p>

        {/* Navigation buttons */}
        <div className="space-y-3 max-w-xs mx-auto">
          <Link
            href="/"
            className="group block w-full px-6 py-3.5 bg-gradient-to-r from-brand-500 to-cyan-400 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition-all duration-300 ease-smooth text-center"
          >
            Take me home
          </Link>

          <Link
            href="/discover"
            className="block w-full px-6 py-3.5 bg-white/80 backdrop-blur-sm text-gray-700 font-medium rounded-xl border border-gray-200/60 hover:border-brand-300 hover:bg-white hover:text-brand-600 transition-all duration-300 ease-smooth text-center shadow-elevation-1"
          >
            Explore wishlists
          </Link>

          <Link
            href="/signup"
            className="block w-full px-6 py-3 text-brand-600 font-medium rounded-xl hover:bg-brand-50 transition-all duration-300 ease-smooth text-center"
          >
            Create your own list
          </Link>
        </div>
      </div>
    </div>
  )
}
