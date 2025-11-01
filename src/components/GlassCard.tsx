interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  rounded?: 'lg' | 'xl' | 'pill';
  intensity?: 'light' | 'normal' | 'ultra';
}

export default function GlassCard({
  children,
  className = '',
  rounded = 'lg',
  intensity = 'light',
}: GlassCardProps) {
  const base = `
    relative
    ${rounded === 'pill' ? 'rounded-[9999px]' : rounded === 'xl' ? 'rounded-xl' : 'rounded-lg'}
    ${
      intensity === 'ultra'
        ? 'bg-white/12 dark:bg-zinc-900/12'
        : intensity === 'light'
        ? 'bg-white/25 dark:bg-zinc-900/25'
        : 'bg-white/35 dark:bg-zinc-900/35'
    }
    backdrop-blur-xl border border-white/5 dark:border-white/5
    shadow-[0_12px_36px_rgba(0,0,0,0.05)]
  `;
  return <div className={`${base} ${className}`}>{children}</div>;
}