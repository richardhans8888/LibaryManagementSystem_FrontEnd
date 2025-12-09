import Link from "next/link";

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2.2 3.5L5 6.3l2.8-2.8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="opacity-90">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-30 bg-[#113a5c] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 font-sans">
        <div className="flex items-center gap-6">
          <button aria-label="Menu" className="rounded p-2 hover:bg-white/10">
            <svg width="20" height="14" viewBox="0 0 24 16" aria-hidden>
              <path d="M2 3h20M2 8h20M2 13h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="text-[16px] font-semibold tracking-wide">Library</div>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link href="#help" className="group inline-flex items-center gap-1 opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100">Help With <span className="opacity-80"><Chevron /></span></Link>
            <Link href="#categories" className="group inline-flex items-center gap-1 opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100">Collection <span className="opacity-80"><Chevron /></span></Link>
            <Link href="#events" className="group inline-flex items-center gap-1 opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100">Event & News <span className="opacity-80"><Chevron /></span></Link>
            <Link href="#about" className="group inline-flex items-center gap-1 opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-100">Visit & About <span className="opacity-80"><Chevron /></span></Link>
          </nav>

        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link href="/login" className="opacity-90 hover:opacity-100">Sign in</Link>
          <span className="opacity-50">|</span>
          <a href="#subscribe" className="opacity-90 hover:opacity-100">Subscribe</a>
          <button aria-label="Search" className="rounded p-2 hover:bg-white/10">
            <SearchIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
