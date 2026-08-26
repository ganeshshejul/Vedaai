"use client";

import Image from "next/image";

export function TopNav() {
  return (
    <header className="h-[80px] w-full flex items-center px-8 bg-transparent">
      {/* Left side: Logo and Title */}
      <div className="flex items-center gap-3 cursor-pointer">
        <Image src="/logo.png" alt="VedaAI Logo" width={32} height={32} />
        <span className="text-2xl font-bold text-gray-900 tracking-tight">VedaAI</span>
      </div>
    </header>
  );
}
