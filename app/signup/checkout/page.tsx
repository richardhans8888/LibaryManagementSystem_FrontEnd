"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupStore } from "@/components/signup/SignupStore";

type PackageFee = {
  total_month: number;
  total_cost: number;
};

export default function SignupCheckoutPage() {
  const router = useRouter();
  const { draft, selectedPlan, setSelectedPlan, clear } = useSignupStore();
  const [packages, setPackages] = useState<PackageFee[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => a.total_month - b.total_month),
    [packages]
  );

  useEffect(() => {
    const load = async () => {
      setLoadingPackages(true);
      setError(null);
      try {
        const res = await fetch("/api/package");
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load packages");
        }
        setPackages(data.packages || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load packages");
      } finally {
        setLoadingPackages(false);
      }
    };
    load();
  }, []);

  const backToForm = () => {
    router.push("/signup");
  };

  const finish = async () => {
    if (!draft.first_name.trim() || !draft.last_name.trim() || !draft.email.trim() || !draft.password.trim()) {
      setError("Please complete your personal details");
      router.push("/signup");
      return;
    }
    if (!selectedPlan) {
      setError("Select a membership package to continue");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...draft,
          total_month: selectedPlan.total_month,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Signup failed");
      }
      clear();
      router.replace("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-2xl font-semibold">Review & pay</div>
        <div className="text-sm text-black/60">Step 2 of 2 — Confirm details and choose a membership package.</div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-base font-semibold">Your details</div>
            <button
              onClick={backToForm}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-50"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-black/60">Name</div>
              <div className="font-medium">{draft.first_name || draft.last_name ? `${draft.first_name} ${draft.last_name}`.trim() : "Not set"}</div>
            </div>
            <div>
              <div className="text-black/60">Email</div>
              <div className="font-medium break-words">{draft.email || "Not set"}</div>
            </div>
            <div>
              <div className="text-black/60">Phone</div>
              <div className="font-medium break-words">{draft.phone_number || "Not set"}</div>
            </div>
            <div>
              <div className="text-black/60">Address</div>
              <div className="font-medium break-words">{draft.address || "Not set"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="text-base font-semibold">Choose a package</div>
          <div className="text-xs text-black/60">Billed once</div>
          {loadingPackages ? (
            <div className="text-sm text-black/60">Loading packages...</div>
          ) : sortedPackages.length === 0 ? (
            <div className="text-sm text-black/60">No packages available. Please try again later.</div>
          ) : (
            <div className="space-y-2">
              {sortedPackages.map((p) => (
                <label
                  key={p.total_month}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm ${selectedPlan?.total_month === p.total_month ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="package"
                      checked={selectedPlan?.total_month === p.total_month}
                      onChange={() => setSelectedPlan(p)}
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-semibold">{p.total_month} month{p.total_month === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <div className="text-base font-semibold">${p.total_cost.toFixed(2)}</div>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={backToForm}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          Back
        </button>
        <button
          onClick={finish}
          disabled={submitting || loadingPackages || !selectedPlan}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Finishing..." : "Finish payment"}
        </button>
      </div>
    </div>
  );
}
