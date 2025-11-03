import { BackButton } from './BackButton';
import MobileBottomNav from './MobileBottomNav';
import FloatingSearchButton from './FloatingSearchButton';
import MobileHeader from './MobileHeader';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface PageLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const PageLayout = ({ children, activePath = '/' }: PageLayoutProps) => {
  return (
    <div className='w-full min-h-screen'>
      {/* 移动端头部 */}
      <MobileHeader showBackButton={['/play'].includes(activePath)} />

      {/* 主要布局容器 */}
      <div className='flex w-full min-h-screen md:min-h-auto'>
        {/* 主内容区域 */}
        <div className='relative min-w-0 flex-1 transition-all duration-300'>
          {/* 桌面端左上角返回按钮 */}
          {['/play'].includes(activePath) && (
            <div className='absolute top-3 left-1 z-20 hidden md:flex'>
              <BackButton />
            </div>
          )}

          {/* 桌面端顶部按钮 */}
          <div
            className='
              absolute top-2 right-4 z-20 hidden md:flex items-center gap-2
              px-2 py-1
              rounded-[9999px]
              border border-white/5 dark:border-white/8
              bg-white/40 dark:bg-zinc-900/20
              backdrop-blur-xl
              shadow-[0_8px_24px_rgba(0,0,0,0.06)]
            '
          >
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* 主内容 */}
          <main
            className='flex-1 md:min-h-0 mb-14 md:mb-0'
            style={{
              paddingBottom: 'calc(3rem + 12px + env(safe-area-inset-bottom))',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      {/* 底部导航：恢复全端统一样式 */}
      <MobileBottomNav activePath={activePath} />
      {/* 移动端右侧独立搜索按钮 */}
      <FloatingSearchButton />
    </div>
  );
};

export default PageLayout;
