"use client";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2.2 3.5L5 6.3l2.8-2.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [dest, setDest] = useState<"/admin" | "/dashboard" | null>(null);
  const [hasSession, setHasSession] = useState(false);

  const openLogin = () => {
    const sp = new URLSearchParams(params.toString());
    sp.set("login", "1");
    router.replace(`${pathname}?${sp.toString()}`);
  };

  const parseCookies = () => {
    if (typeof document === "undefined") return { dest: null as "/admin" | "/dashboard" | null, session: false };
    const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, c) => {
      const [k, ...v] = c.trim().split("=");
      if (k) acc[k] = decodeURIComponent(v.join("="));
      return acc;
    }, {});
    if (cookies.admin_session) return { dest: "/admin" as const, session: true };
    if (cookies.member_public) return { dest: "/dashboard" as const, session: true };
    return { dest: null as "/admin" | "/dashboard" | null, session: false };
  };

  useEffect(() => {
    const { dest, session } = parseCookies();
    setDest(dest);
    setHasSession(session);
  }, [pathname]);

  const goDashboard = () => {
    const { dest: latestDest, session } = parseCookies();
    setDest(latestDest);
    setHasSession(session);
    if (!latestDest) {
      openLogin();
      return;
    }
    router.push(latestDest);
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    document.cookie = "admin_session=; path=/; max-age=0";
    document.cookie = "member_public=; path=/; max-age=0";
    setDest(null);
    setHasSession(false);
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 border-b border-zinc-200 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-sans text-2xl font-semibold tracking-wide text-[#0d2538]" style={{ fontFamily: 'var(--font-dm-sans)' }}>Library</Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-zinc-700">
          <div className="group relative">
            <button className="flex items-center gap-1 hover:text-black">Collection <Chevron /></button>
            <div className="absolute top-full left-0 mt-2 w-48 rounded-lg bg-white shadow-lg ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="py-1">
                <Link href="/books" className="block px-4 py-2 hover:bg-zinc-50">All Books</Link>
                <Link href="/authors" className="block px-4 py-2 hover:bg-zinc-50">Authors</Link>
                <Link href="/categories" className="block px-4 py-2 hover:bg-zinc-50">Categories</Link>
              </div>
            </div>
          </div>
          <button onClick={goDashboard} className="hover:text-black">Dashboard</button>
          {hasSession ? (
            <button onClick={logout} className="hover:text-black">Logout</button>
          ) : (
            <button onClick={openLogin} className="hover:text-black">Login</button>
          )}
        </nav>
      </div>
    </header>
  );
}
