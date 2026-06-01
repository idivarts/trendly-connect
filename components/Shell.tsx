import Logo from '@/components/Logo';

// Shared page shell — centered column on the dark radial background, with the
// Trendly wordmark at the top. Used by the connect picker and the per-platform
// consent screen so they stay visually identical.
export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center px-5 py-12"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.18) 0%, transparent 60%), #0b1020',
      }}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo className="h-8" />
        </div>
        {children}
      </div>
    </main>
  );
}

export function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
