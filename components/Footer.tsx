export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-12 border-t border-zinc-200 bg-white text-black">
      <div className="mx-auto max-w-7xl px-6 py-6 text-sm">
        <div className="flex items-center justify-between">
          <div>© {year} Library</div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Terms</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
