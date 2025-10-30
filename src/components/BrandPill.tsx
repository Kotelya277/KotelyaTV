interface BrandPillProps {
  className?: string;
}

export default function BrandPill({ className = "" }: BrandPillProps) {
  return (
    <div
      className={`
        inline-flex items-center justify-center
        px-6 py-3
        text-base sm:text-lg font-bold
        text-zinc-700 dark:text-zinc-200
        bg-white/30 dark:bg-zinc-900/30
        backdrop-blur-xl
        border border-white/5 dark:border-white/5
        rounded-[9999px]
        shadow-[0_12px_36px_rgba(0,0,0,0.05)]
        md:shadow-[0_12px_36px_rgba(0,0,0,0.05)]
        transition-all duration-300
        ${className}
      `}
    >
      KotelyaTV
    </div>
  );
}