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
        right-10 md:right-[calc((100vw-820px)/2-8px)] bottom-[calc(12px+env(safe-area-inset-bottom))]
        w-11 h-11 sm:w-12 sm:h-12 md:w-18 md:h-18 rounded-full
        flex items-center justify-center
        bg-white/40 dark:bg-zinc-900/20
        backdrop-blur-xl
        border border-white/5 dark:border-white/5
        shadow-[0_12px_36px_rgba(0,0,0,0.05)]
        hover:bg-white/60 dark:hover:bg-zinc-900/35
      "
    >
      <Search className="w-5 h-5 sm:w-6 sm:h-6 md:w-9 md:h-9 text-gray-700 dark:text-gray-200" />
    </Link>
  );
}