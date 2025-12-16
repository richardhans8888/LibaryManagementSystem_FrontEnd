"use client";
import { useEffect, useMemo, useState } from "react";

type Payment = {
  payment_id: number;
  membership_id: number;
  total_month: number;
  total_cost: number | null;
  member_name: string | null;
  membership_end_date: string | null;
  blacklisted_at: string | null;
  membership_start_date: string | null;
};

const statusBadge = (label: string) => {
  const base = "inline-flex items-center rounded-full px-2 py-1 text-xs";
  if (label === "ACTIVE") return `${base} bg-green-100 text-green-800`;
  if (label === "EXPIRED") return `${base} bg-amber-100 text-amber-800`;
  if (label === "BLACKLISTED") return `${base} bg-rose-100 text-rose-800`;
  return `${base} bg-zinc-100 text-zinc-800`;
};

export default function Page() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...payments].sort((a, b) => b.payment_id - a.payment_id),
    [payments]
  );

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load payments");
      setPayments(data.payments || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Payments</div>
        <div className="text-sm text-black/60">Read-only view of membership invoices/payments.</div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Payment ID</th>
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Package</th>
              <th className="px-4 py-2 text-left">Cost</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={7}>Loading payments...</td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={7}>No payments found</td>
              </tr>
            ) : (
              sorted.map((p) => (
                <tr key={p.payment_id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">#{p.payment_id}</td>
                  <td className="px-4 py-2">{p.member_name || "Unknown"}</td>
                  <td className="px-4 py-2">{p.total_month} month{p.total_month === 1 ? "" : "s"}</td>
                  <td className="px-4 py-2">{p.total_cost !== null ? `$${p.total_cost.toFixed(2)}` : "—"}</td>
                  <td className="px-4 py-2">{p.membership_start_date ? p.membership_start_date.slice(0, 10) : "—"}</td>
                  <td className="px-4 py-2">{p.membership_end_date ? p.membership_end_date.slice(0, 10) : "—"}</td>
                  <td className="px-4 py-2">
                    {(() => {
                      const end = p.membership_end_date ? new Date(p.membership_end_date) : null;
                      if (end) end.setHours(0, 0, 0, 0);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const derived = p.blacklisted_at ? "BLACKLISTED" : end && end < today ? "EXPIRED" : "ACTIVE";
                      return <span className={statusBadge(derived)}>{derived}</span>;
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
