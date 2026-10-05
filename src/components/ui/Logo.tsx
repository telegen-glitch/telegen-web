/** Telegen wordmark: an open ring (a growth cycle) and a lowercase serif name. */
export function Logo({ className = "", inverse = false }: { className?: string; inverse?: boolean }) {
  const ink = inverse ? "text-white" : "text-navy-950";
  return (
    <span className={`inline-flex items-center gap-2 ${ink} ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none">
        <path
          d="M19.4 7.5A8.5 8.5 0 1 0 20.5 12"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="20.4" cy="4.6" r="2.1" className="fill-blue-600" />
      </svg>
      <span className="font-serif text-[1.5rem] leading-none font-medium tracking-[-0.02em]">telegen</span>
    </span>
  );
}
