export default function Logo({ className = 'h-7' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/logo.png" alt="Trendly" className={className} />
  );
}
