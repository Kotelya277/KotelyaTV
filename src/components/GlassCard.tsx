interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  rounded?: 'lg' | 'xl' | 'pill';
  intensity?: 'light' | 'normal';
}

export default function GlassCard({
  children,
  className = '',
  rounded = 'lg',
  intensity = 'light',
}: GlassCardProps) {
  const radius = rounded === 'pill' ? 'rounded-[9999px]' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg';
  const bgLight = 'bg-white/25 dark:bg-zinc-900/15';
  const bgNormal = 'bg-white/35 dark:bg-zinc-900/20';
  const base = `
    relative ${radius}
    ${intensity === 'light' ? bgLight : bgNormal}
    backdrop-blur-xl border border-white/5 dark:border-white/8
    shadow-[0_8px_24px_rgba(0,0,0,0.06)]
  `;
  return <div className={`${base} ${className}`}>{children}</div>;
}