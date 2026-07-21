"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { num: 1, label: "Overview", href: "/" },
  { num: 2, label: "Wallet Rankings", href: "/wallets" },
  { num: 3, label: "Wallet Profile", href: "/wallet-profile" },
  { num: 4, label: "Trade Signals", href: "/signals" },
  { num: 5, label: "Paper Trades", href: "/paper-trades" },
  { num: 6, label: "Decision Journal", href: "/journal" },
  { num: 7, label: "Performance", href: "/performance" },
  { num: 8, label: "Rules", href: "/rules" },
  { num: 9, label: "Reports", href: "/reports" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/50">
      <div className="px-5 py-4 text-sm font-semibold text-zinc-100">
        Poly Copy Bot
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.num}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
                active
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-800 text-[10px] font-semibold text-zinc-400">
                {item.num}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-3 text-[10px] uppercase tracking-wider text-zinc-600">
        Layer 2 · Vercel
      </div>
    </aside>
  );
}
