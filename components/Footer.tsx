export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-xl font-semibold">Library</div>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Connect with materials and services to get your work done.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Explore</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#collections">Collections</a></li>
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#services">Services</a></li>
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#events">Events</a></li>
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#visit">Visit</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Help</div>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#ask">Ask a Librarian</a></li>
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#hours">Hours</a></li>
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#policies">Borrowing Policies</a></li>
              <li><a className="hover:text-zinc-900 dark:hover:text-zinc-200" href="#accessibility">Accessibility</a></li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Stay in touch</div>
            <form className="mt-3 flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-0 focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              />
              <button className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row">
          <div>© {new Date().getFullYear()} Library. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-zinc-700 dark:hover:text-zinc-300">Privacy</a>
            <a href="#terms" className="hover:text-zinc-700 dark:hover:text-zinc-300">Terms</a>
            <a href="#contact" className="hover:text-zinc-700 dark:hover:text-zinc-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

