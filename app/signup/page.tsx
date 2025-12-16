"use client";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/components/signup/SignupStore";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const { draft, updateDraft } = useSignupStore();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.first_name.trim() || !draft.last_name.trim() || !draft.email.trim() || !draft.password.trim()) {
      setError("First name, last name, email, and password are required");
      return;
    }
    setError(null);
    router.push("/signup/checkout");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-2xl font-semibold">Create your membership</div>
        <div className="text-sm text-black/60">
          Step 1 of 2 — Tell us about yourself. You can review details before confirming payment.
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60 block mb-1">First Name</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={draft.first_name}
              onChange={(e) => updateDraft({ first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs text-black/60 block mb-1">Last Name</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={draft.last_name}
              onChange={(e) => updateDraft({ last_name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60 block mb-1">Address</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={draft.address}
              onChange={(e) => updateDraft({ address: e.target.value })}
              placeholder="Street, City"
            />
          </div>
          <div>
            <label className="text-xs text-black/60 block mb-1">Phone Number</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={draft.phone_number}
              onChange={(e) => updateDraft({ phone_number: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60 block mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={draft.email}
              onChange={(e) => updateDraft({ email: e.target.value })}
              required
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs text-black/60 block mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={draft.password}
              onChange={(e) => updateDraft({ password: e.target.value })}
              required
              placeholder="Choose a password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
