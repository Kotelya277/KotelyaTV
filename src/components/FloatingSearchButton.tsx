"use client";

import { Search } from "lucide-react";
import Link from "next/link";

export default function FloatingSearchButton() {
  return (
    <Link
      href="/search"
      aria-label="搜索"
      className="
        fixed z-[650]
        right-[calc(var(--bottom-nav-right)-60px)] md:right-[calc((100vw-700px)/2-80px)] bottom-[calc(28px+env(safe-area-inset-bottom))] md:bottom-[calc(26px+env(safe-area-inset-bottom))]
        w-[52px] h-12 sm:w-[48px] sm:h-[52px] md:w-[64px] md:h-[64px] rounded-full
        flex items-center justify-center
        bg-white/10 dark:bg-zinc-900/10
        backdrop-blur-lg
        border border-white/10 dark:border-white/10
        shadow-[0_12px_36px_rgba(0,0,0,0.05)]
        hover:bg-white/20 dark:hover:bg-zinc-900/20
      "
    >
      <Search className="w-6 h-6 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-700 dark:text-gray-200" />
    </Link>
  );
}