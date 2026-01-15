"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mergeClassNames } from "@/shared/lib/utils";
import { GlobalSearchBar } from "./global-search-bar.client";

const HOME_LABEL = "현재위치";
const FAVORITES_LABEL = "즐겨찾기";
const NAV_BASE_CLASS_NAME =
  "rounded-full px-3 py-1.5 text-sm font-semibold transition-colors";
const NAV_ACTIVE_CLASS_NAME = "bg-foreground text-background";
const NAV_INACTIVE_CLASS_NAME =
  "text-muted-foreground hover:text-foreground hover:bg-muted";

export function GlobalNavigationBar() {
  const pathname = usePathname();
  const isHomeActive = pathname === "/";
  const isFavoritesActive = pathname.startsWith("/favorites");

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <nav
          className="flex items-center gap-2 shrink-0"
          aria-label="주요 이동"
        >
          <Link
            href="/"
            aria-current={isHomeActive ? "page" : undefined}
            className={mergeClassNames(
              NAV_BASE_CLASS_NAME,
              isHomeActive ? NAV_ACTIVE_CLASS_NAME : NAV_INACTIVE_CLASS_NAME
            )}
          >
            {HOME_LABEL}
          </Link>
          <Link
            href="/favorites"
            aria-current={isFavoritesActive ? "page" : undefined}
            className={mergeClassNames(
              NAV_BASE_CLASS_NAME,
              isFavoritesActive
                ? NAV_ACTIVE_CLASS_NAME
                : NAV_INACTIVE_CLASS_NAME
            )}
          >
            {FAVORITES_LABEL}
          </Link>
        </nav>
        <GlobalSearchBar />
      </div>
    </header>
  );
}
