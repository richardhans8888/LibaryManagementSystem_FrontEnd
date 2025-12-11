"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Role = "member" | "admin";

export default function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>("member");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-white/70" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-xl ring-1 ring-zinc-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("login")}
              className={`rounded-md px-3 py-1 text-sm ${mode === "login" ? "bg-white text-black border border-zinc-300" : "bg-zinc-100 text-black/80"}`}
            >
              Log in
            </button>
            <button
              onClick={() => setMode("register")}
              className={`rounded-md px-3 py-1 text-sm ${mode === "register" ? "bg-white text-black border border-zinc-300" : "bg-zinc-100 text-black/80"}`}
            >
              Sign up
            </button>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-md px-2 py-1 text-black/70 hover:bg-zinc-100">✕</button>
        </div>

        <div className="px-6 py-5">
          <div className="mb-4 text-center text-xl font-semibold text-black">{mode === "login" ? "Log in" : "Create account"}</div>

          <div className="mb-3 flex items-center justify-center gap-2">
            <button
              onClick={() => setRole("member")}
              className={`rounded-md px-3 py-1 text-xs ${role === "member" ? "bg-[#3ea6ff] text-[#0d2538]" : "bg-zinc-100 text-black/80"}`}
            >
              Member
            </button>
            <button
              onClick={() => setRole("admin")}
              className={`rounded-md px-3 py-1 text-xs ${role === "admin" ? "bg-[#3ea6ff] text-[#0d2538]" : "bg-zinc-100 text-black/80"}`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-3 text-black">
            <button onClick={() => router.push(role === "admin" ? "/admin" : "/dashboard")} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-left flex items-center gap-2">
              <span className="inline-block h-4 w-4">🇬</span>
              <span>Continue with Google</span>
            </button>
            <button onClick={() => router.push(role === "admin" ? "/admin" : "/dashboard")} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-left flex items-center gap-2">
              <span className="inline-block h-4 w-4"></span>
              <span>Continue with Apple</span>
            </button>
            <button onClick={() => router.push(role === "admin" ? "/admin" : "/dashboard")} className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-left flex items-center gap-2">
              <span className="inline-block h-4 w-4">in</span>
              <span>Continue with LinkedIn</span>
            </button>
          </div>

          <div className="my-4 flex items-center gap-2 text-xs text-black">
            <div className="h-px flex-1 bg-zinc-200" />
            <div>OR</div>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <form onSubmit={onSubmit} noValidate className="space-y-3">
            {mode === "register" && (
              <input
                type="text"
                placeholder="Full name"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            )}
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-black/70 hover:bg-zinc-100"
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
            <button type="submit" className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm text-black">
              Continue
            </button>
          </form>

          {mode === "login" ? (
            <div className="mt-3 text-center text-sm text-black">
              <a href="#" className="hover:underline">Forgot Password?</a>
            </div>
          ) : null}

          <div className="mt-6 border-t border-zinc-200 pt-4 text-center text-sm text-black">
            {mode === "login" ? (
              <span>
                Not a member yet? <button onClick={() => setMode("register")} className="underline">Sign up</button>
              </span>
            ) : (
              <span>
                Already have an account? <button onClick={() => setMode("login")} className="underline">Log in</button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
