"use client";
import { useEffect, useMemo, useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import Link from "next/link";

type Membership = {
  member_id: number;
  first_name: string;
  last_name: string;
  membership_start_date: string;
  membership_end_date: string | null;
  blacklisted_at: string | null;
};

const statusBadge = (value: string) => {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs";
  if (value === "active") return `${base} bg-green-100 text-green-800`;
  if (value === "expired") return `${base} bg-amber-100 text-amber-800`;
  if (value === "blacklist") return `${base} bg-rose-100 text-rose-800`;
  return `${base} bg-zinc-100 text-zinc-800`;
};

export default function Page() {
  const memberId = useMemo(() => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, c) => {
      const [k, ...v] = c.trim().split("=");
      if (k) acc[k] = decodeURIComponent(v.join("="));
      return acc;
    }, {});
    if (!cookies.member_session && !cookies.member_public) return null;
    try {
      const raw = cookies.member_session || cookies.member_public;
      const decoded = typeof atob === "function" ? atob(raw) : "";
      const parsed = JSON.parse(decoded);
      return parsed.member_id as number;
    } catch {
      return null;
    }
  }, []);

  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [derivedStatus, setDerivedStatus] = useState<"active" | "expired" | "blacklist">("active");

  useEffect(() => {
    if (!memberId) {
      setError("Please log in to view membership details.");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/member/${memberId}`);
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load membership");
        setMembership(data.member);
        const end = data.member.membership_end_date ? new Date(data.member.membership_end_date) : null;
        if (end) end.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const status = data.member.blacklisted_at
          ? "blacklist"
          : end && end < today
            ? "expired"
            : "active";
        setDerivedStatus(status);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load membership");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberId]);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Membership" subtitle="Your membership details" />
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4 space-y-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading membership...</div>
        ) : !membership ? (
          <div className="text-sm text-black/60">No membership details available.</div>
        ) : (
          <>
            <div className="text-lg font-semibold">
              {membership.first_name} {membership.last_name}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-xs uppercase text-black/50">Membership Start</div>
                <div className="mt-1 font-semibold">
                  {new Date(membership.membership_start_date).toLocaleDateString()}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-xs uppercase text-black/50">Membership End</div>
                <div className="mt-1 font-semibold">
                  {membership.membership_end_date
                    ? new Date(membership.membership_end_date).toLocaleDateString()
                    : "No end date"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-black/60">Status:</span>
              <span className={statusBadge(derivedStatus)}>{derivedStatus.toUpperCase()}</span>
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard/membership/renew"
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Renew / Extend Membership
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
