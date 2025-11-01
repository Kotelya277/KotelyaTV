interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tint?: 'none' | 'green' | 'blue';
  rounded?: 'pill' | 'lg';
}

export default function GlassButton({
  children,
  tint = 'green',
  rounded = 'lg',
  className = '',
  disabled,
  ...rest
}: GlassButtonProps) {
  const base = `
    inline-flex items-center justify-center w-full
    px-4 py-3 text-base font-semibold
    text-white transition-all duration-200
    backdrop-blur-xl border border-white/5 dark:border-white/5
    shadow-[0_12px_36px_rgba(0,0,0,0.05)]
    ${rounded === 'pill' ? 'rounded-[9999px]' : 'rounded-lg'}
    disabled:cursor-not-allowed disabled:opacity-50
  `;

  const tints = {
    none: 'bg-white/30 dark:bg-zinc-900/30 text-gray-900 dark:text-gray-100',
    green:
      'bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/80 hover:to-emerald-700/80',
    blue:
      'bg-gradient-to-r from-sky-500/80 to-blue-600/80 hover:from-sky-600/80 hover:to-blue-700/80',
  } as const;

  return (
    <button {...rest} disabled={disabled} className={`${base} ${tints[tint]} ${className}`}> 
      {children}
    </button>
  );
}