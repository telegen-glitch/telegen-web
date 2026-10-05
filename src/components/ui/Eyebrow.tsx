export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-eyebrow text-blue-700 ${className}`}>{children}</p>;
}
