"use client";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const openLogin = () => {
    const sp = new URLSearchParams(params.toString());
    sp.set("login", "1");
    router.replace(`${pathname}?${sp.toString()}`);
  };
  return (
    <header className="bg-white/90 border-b border-zinc-200 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-black">Library</Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/books" className="text-black hover:underline">Books</Link>
          <Link href="/collections" className="text-black hover:underline">Collections</Link>
          <button onClick={openLogin} className="text-black hover:underline">Login</button>
        </nav>
      </div>
    </header>
  );
}
