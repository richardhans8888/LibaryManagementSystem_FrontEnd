"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "member" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("member");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    try {
      router.back();
    } catch {
      router.replace("/");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (role === "admin") {
        document.cookie = "admin_session=true; path=/; max-age=604800";
        document.cookie = "member_public=; path=/; max-age=0";
        document.cookie = "member_session=; path=/; max-age=0";
        router.replace("/admin");
        return;
      }
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
      document.cookie = "admin_session=; path=/; max-age=0";
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-zinc-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="text-base font-semibold">Sign In</div>
          <button onClick={close} aria-label="Close" className="rounded-md px-2 py-1 text-black/70 hover:bg-zinc-100">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setRole("member")}
              className={`rounded-md px-3 py-1 text-xs ${role === "member" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black/80"}`}
            >
              Member
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`rounded-md px-3 py-1 text-xs ${role === "admin" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-black/80"}`}
            >
              Admin
            </button>
          </div>

          {error ? <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</div> : null}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-black/60 block mb-1">Email</label>
              <input
                type="email"
                required={role === "member"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                disabled={role === "admin"}
              />
            </div>
            <div>
              <label className="text-xs text-black/60 block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  required={role === "member"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={role === "admin" ? "Not required for Admin" : "Password"}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-10 text-sm"
                  disabled={role === "admin"}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-black/70 hover:bg-zinc-100"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Continue"}
            </button>
          </form>

          <div className="text-xs text-black/60 text-center space-y-2">
            <div>
              Accounts are created by staff. Need help? Contact support.
            </div>
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-black hover:bg-zinc-50"
            >
              New here? Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
