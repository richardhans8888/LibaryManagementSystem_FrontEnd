"use client";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    <header className="bg-white/90 border-b border-[#0d2538] backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col items-center gap-3">
        <Link href="/" className="font-sans text-4xl md:text-5xl font-semibold tracking-wide" style={{ fontFamily: 'var(--font-dm-sans)' }}>Library</Link>
        <nav className="flex items-center gap-8 text-base">
          <Link href="/books" className="text-black hover:underline">Books</Link>
          <button onClick={goDashboard} className="text-black hover:underline">Dashboard</button>
          {hasSession ? (
            <button onClick={logout} className="text-black hover:underline">Logout</button>
          ) : (
            <button onClick={openLogin} className="text-black hover:underline">Login</button>
          )}
        </nav>
      </div>
    </header>
  );
}
