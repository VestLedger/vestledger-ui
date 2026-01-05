type DashboardMockupProps = {
  className?: string;
};

export function DashboardMockup({ className = '' }: DashboardMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Browser Window Frame */}
      <div className="rounded-lg overflow-hidden shadow-2xl border border-[var(--app-border)]">
        {/* Browser Chrome */}
        <div className="bg-[var(--app-surface)] border-b border-[var(--app-border)] px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-[var(--app-bg)] rounded px-3 py-1.5 text-xs text-[var(--app-text-muted)] flex items-center gap-2">
              <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">app.vestledger.com</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-[var(--app-bg)] p-6 relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Header */}
          <div className="relative mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <div className="h-4 w-32 bg-[var(--app-surface)] rounded animate-pulse"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-[var(--app-surface)] animate-pulse"></div>
                <div className="w-8 h-8 rounded bg-[var(--app-surface)] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="relative grid grid-cols-3 gap-4 mb-6">
            {[
              { delay: '0s', color: 'from-blue-500/20 to-blue-600/10' },
              { delay: '0.2s', color: 'from-emerald-500/20 to-emerald-600/10' },
              { delay: '0.4s', color: 'from-purple-500/20 to-purple-600/10' },
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${card.color} backdrop-blur-sm rounded-lg p-4 border border-[var(--app-border)] animate-pulse`}
                style={{ animationDelay: card.delay }}
              >
                <div className="h-3 w-16 bg-[var(--app-surface)]/60 rounded mb-3"></div>
                <div className="h-6 w-20 bg-[var(--app-surface)]/80 rounded mb-2"></div>
                <div className="h-2 w-12 bg-[var(--app-surface)]/40 rounded"></div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="relative bg-gradient-to-br from-[var(--app-surface)]/60 to-[var(--app-surface)]/30 backdrop-blur-sm rounded-lg p-6 border border-[var(--app-border)] mb-4">
            <div className="h-3 w-24 bg-[var(--app-surface)]/60 rounded mb-4"></div>

            {/* Animated Chart */}
            <div className="h-40 flex items-end justify-between gap-2">
              {[60, 75, 55, 80, 70, 85, 65, 90, 75, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500/60 to-purple-500/60 rounded-t transition-all duration-1000"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>

            {/* Chart Labels */}
            <div className="flex justify-between mt-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-2 w-6 bg-[var(--app-surface)]/40 rounded"></div>
              ))}
            </div>
          </div>

          {/* Table Preview */}
          <div className="relative bg-gradient-to-br from-[var(--app-surface)]/60 to-[var(--app-surface)]/30 backdrop-blur-sm rounded-lg border border-[var(--app-border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--app-border)]">
              <div className="h-3 w-28 bg-[var(--app-surface)]/60 rounded"></div>
            </div>
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-32 bg-[var(--app-surface)]/60 rounded"></div>
                    <div className="h-2 w-24 bg-[var(--app-surface)]/40 rounded"></div>
                  </div>
                  <div className="h-2 w-16 bg-[var(--app-surface)]/60 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg animate-bounce">
            Live Data
          </div>
        </div>
      </div>

      {/* Floating cards around mockup */}
      <div className="absolute -top-4 -left-4 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-md rounded-lg p-3 border border-blue-500/20 shadow-xl dashboard-float">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium">99.9% Uptime</span>
        </div>
      </div>

      <div className="absolute -bottom-4 -right-4 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-md rounded-lg p-3 border border-purple-500/20 shadow-xl dashboard-float-delayed">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs font-medium">AI Powered</span>
        </div>
      </div>
    </div>
  );
}
