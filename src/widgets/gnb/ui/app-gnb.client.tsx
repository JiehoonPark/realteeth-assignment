'use client';

import Link from "next/link";

import { GlobalSearchBar } from "@/widgets/gnb/ui/global-search-bar.client";

const HOME_LABEL = "현재 위치 날씨로 돌아가기";

export function AppGnb() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <Link href="/" className="text-sm font-semibold text-foreground hover:text-primary">
          {HOME_LABEL}
        </Link>
        <GlobalSearchBar />
      </div>
    </header>
  );
}
