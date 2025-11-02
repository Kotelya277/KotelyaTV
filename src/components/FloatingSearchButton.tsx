"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export default function FloatingSearchButton() {
  const [right, setRight] = useState<number | null>(null);

  useEffect(() => {
    const updateRight = () => {
      const nav = document.getElementById("mobileBottomNav");
      if (!nav) {
        setRight(null);
        return;
      }
      const rect = nav.getBoundingClientRect();
      // 与底栏右边界对齐，保留 8px 间距；最小 10px
      const gap = 8;
      const calculated = Math.max(window.innerWidth - rect.right + gap, 10);
      setRight(calculated);
    };
    updateRight();
    window.addEventListener("resize", updateRight);
    return () => window.removeEventListener("resize", updateRight);
  }, []);

  return (
    <Link
      href="/search"
      aria-label="搜索"
      className="
        fixed z-[650]
        bottom-[calc(12px+env(safe-area-inset-bottom))]
        w-11 h-11 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full
        flex items-center justify-center
        bg-white/40 dark:bg-zinc-900/20
        backdrop-blur-xl
        border border-white/5 dark:border-white/5
        shadow-[0_12px_36px_rgba(0,0,0,0.05)]
        hover:bg-white/60 dark:hover:bg-zinc-900/35
      "
      style={{ right: right ?? 10 }}
    >
      <Search className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-700 dark:text-gray-200" />
    </Link>
  );
}