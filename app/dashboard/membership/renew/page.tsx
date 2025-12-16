"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/dashboard/Header";

type PackageFee = {
  total_month: number;
  total_cost: number;
};

type Membership = {
  membership_start_date: string;
  membership_end_date: string | null;
  first_name: string;
  last_name: string;
  blacklisted_at: string | null;
};

export default function RenewPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageFee[]>([]);
  const [selected, setSelected] = useState<PackageFee | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => a.total_month - b.total_month),
    [packages]
  );

  useEffect(() => {
    const loadMembership = async () => {
      setLoading(true);
      setError(null);
      try {
        // reuse member info endpoint
        const cookie = document.cookie.split(";").find((c) => c.trim().startsWith("member_session=") || c.trim().startsWith("member_public="));
        const raw = cookie ? cookie.split("=")[1] : null;
        if (!raw) throw new Error("Not logged in");
        const decodedStr = typeof atob === "function" ? atob(raw) : "";
        const decoded = JSON.parse(decodedStr);
        const memberId = decoded.member_id;
        const res = await fetch(`/api/member/${memberId}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load membership");
        setMembership(data.member);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load membership");
      } finally {
        setLoading(false);
      }
    };

    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        const res = await fetch("/api/package");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load packages");
        setPackages(data.packages || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load packages");
      } finally {
        setLoadingPackages(false);
      }
    };

    loadMembership();
    loadPackages();
  }, []);

  const renew = async () => {
    if (!selected) {
      setError("Choose a package to continue");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/member/renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_month: selected.total_month }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Renewal failed");
      router.replace("/dashboard/membership");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Renewal failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Renew or Extend" subtitle="Select a package to continue your membership" />
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-base font-semibold">Your membership</div>
          {loading ? (
            <div className="text-sm text-black/60">Loading...</div>
          ) : membership ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-black/60">Name</div>
                <div className="font-semibold">{membership.first_name} {membership.last_name}</div>
              </div>
              <div>
                <div className="text-black/60">Status</div>
                <div className="font-semibold capitalize">
                  {(() => {
                    const end = membership.membership_end_date ? new Date(membership.membership_end_date) : null;
                    if (end) end.setHours(0, 0, 0, 0);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const status = membership.blacklisted_at
                      ? "Blacklisted"
                      : end && end < today
                        ? "Expired"
                        : "Active";
                    return status;
                  })()}
                </div>
              </div>
              <div>
                <div className="text-black/60">Start date</div>
                <div className="font-semibold">{membership.membership_start_date ? new Date(membership.membership_start_date).toLocaleDateString() : "—"}</div>
              </div>
              <div>
                <div className="text-black/60">End date</div>
                <div className="font-semibold">{membership.membership_end_date ? new Date(membership.membership_end_date).toLocaleDateString() : "—"}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-black/60">No membership data found.</div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
          <div className="text-base font-semibold">Choose a package</div>
          <div className="text-xs text-black/60">Billed once</div>
          {loadingPackages ? (
            <div className="text-sm text-black/60">Loading packages...</div>
          ) : sortedPackages.length === 0 ? (
            <div className="text-sm text-black/60">No packages available right now.</div>
          ) : (
            <div className="space-y-2">
              {sortedPackages.map((p) => (
                <label
                  key={p.total_month}
                  className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm ${selected?.total_month === p.total_month ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="package"
                      checked={selected?.total_month === p.total_month}
                      onChange={() => setSelected(p)}
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
          onClick={() => router.back()}
          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
        >
          Back
        </button>
        <button
          onClick={renew}
          disabled={submitting || !selected}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitting ? "Processing..." : "Confirm renewal"}
        </button>
      </div>
    </div>
  );
}
