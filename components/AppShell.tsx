"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useSettings } from "@/lib/hooks";

const TABS = [
  {
    href: "/",
    label: "홈",
    match: ["/", "/identify", "/guide"],
    path: "M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4z",
  },
  {
    href: "/records",
    label: "내 기록",
    match: ["/records"],
    path: "M6 4h12v16l-6-3.6L6 20z",
  },
  {
    href: "/setup?change=1",
    label: "설정",
    match: ["/setup"],
    path: "M12 3a6.5 6.5 0 0 0-6.5 6.5C5.5 14 12 21 12 21s6.5-7 6.5-11.5A6.5 6.5 0 0 0 12 3zm0 9a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z",
  },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, settings } = useSettings();
  const needsSetup = ready && !settings && pathname !== "/setup";

  useEffect(() => {
    if (needsSetup) router.replace("/setup");
  }, [needsSetup, router]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-paper md:shadow-[0_0_0_1px_var(--color-line)]">
      <main className="flex-1 px-4 pt-5 pb-28">{needsSetup ? null : children}</main>
      {settings && (
        <nav
          aria-label="주요 메뉴"
          className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px] border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
        >
          <ul className="grid grid-cols-3">
            {TABS.map((tab) => {
              const active = tab.match.includes(pathname);
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                      active ? "text-leaf" : "text-muted"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="size-6"
                      fill="currentColor"
                    >
                      <path d={tab.path} fillRule="evenodd" />
                    </svg>
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
