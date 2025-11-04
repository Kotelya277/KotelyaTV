"use client";

import { getAuthInfoFromBrowserCookie } from "@/lib/auth";

export default function GreetingBanner({ subtitle }: { subtitle?: string }) {
  const auth = getAuthInfoFromBrowserCookie();
  const username = auth?.username || "游客";

  const hour = typeof window !== "undefined" ? new Date().getHours() : 12;
  const timeGreeting =
    hour < 6
      ? "凌晨好"
      : hour < 12
      ? "早上好"
      : hour < 18
      ? "下午好"
      : "晚上好";

  return (
    <div
      className="
        inline-flex items-center gap-2
        px-4 py-2
        rounded-2xl
        bg-gradient-to-r from-indigo-500 via-sky-500 to-purple-500
        text-white
        shadow-[0_12px_36px_rgba(0,0,0,0.08)]
        border border-white/10
        backdrop-blur-xl
      "
    >
      <span className="font-semibold">
        {timeGreeting}，{username}
      </span>
      <span className="opacity-90">{subtitle ?? "👋 发现更多精彩视频内容 ✨"}</span>
    </div>
  );
}