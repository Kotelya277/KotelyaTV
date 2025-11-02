'use client';


import { BackButton } from './BackButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='md:hidden relative w-full'>
      {/* 左侧：返回按钮（保留） */}
      <div className='absolute top-2 left-2 z-20 flex items-center'>
        {showBackButton && <BackButton />}
      </div>

      {/* 右侧：主题与用户菜单（液态玻璃） */}
      <div
        className='
          absolute top-2 right-3 z-20 flex items-center gap-2
          px-1 py-0.5
          rounded-[9999px]
          border border-white/5 dark:border-white/8
          bg-white/40 dark:bg-zinc-900/20
          backdrop-blur-xl
          shadow-[0_8px_24px_rgba(0,0,0,0.06)]
          transform scale-90 sm:scale-100
        '
      >
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
};

export default MobileHeader;
