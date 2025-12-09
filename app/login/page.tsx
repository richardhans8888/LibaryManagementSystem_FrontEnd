export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="text-xl font-semibold">Log in</div>
        <form className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
          <button className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

