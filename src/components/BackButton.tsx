import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className='
        w-10 h-10 p-2 rounded-[9999px]
        flex items-center justify-center
        text-gray-700 dark:text-gray-200
        bg-white/40 dark:bg-zinc-900/40
        backdrop-blur-xl
        border border-white/5 dark:border-white/5
        shadow-[0_12px_36px_rgba(0,0,0,0.05)]
        transition-all duration-200
        hover:bg-white/60 dark:hover:bg-zinc-900/60
      '
      aria-label='Back'
    >
      <ArrowLeft className='w-full h-full' />
    </button>
  );
}
