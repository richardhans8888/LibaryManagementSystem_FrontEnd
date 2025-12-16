"use client";
import { useEffect, useMemo, useState } from "react";

type PackageFee = {
  total_month: number;
  total_cost: number;
};

export default function Page() {
  const [packages, setPackages] = useState<PackageFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingMonth, setDeletingMonth] = useState<number | null>(null);
  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [months, setMonths] = useState("");
  const [cost, setCost] = useState("");
  const [editMonths, setEditMonths] = useState("");
  const [editCost, setEditCost] = useState("");

  const sortedPackages = useMemo(
    () => [...packages].sort((a, b) => a.total_month - b.total_month),
    [packages]
  );

  const loadPackages = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const total_month = Number(months);
      const total_cost = Number(cost);
      if (!Number.isFinite(total_month) || !Number.isFinite(total_cost) || total_month <= 0 || total_cost <= 0) {
        throw new Error("Months and cost must be positive numbers");
      }

      const res = await fetch("/api/package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_month, total_cost }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add package");
      }

      setPackages((curr) => [
        { total_month, total_cost },
        ...curr.filter((p) => p.total_month !== total_month),
      ]);
      setMonths("");
      setCost("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add package");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (pkg: PackageFee) => {
    setEditingMonth(pkg.total_month);
    setEditMonths(String(pkg.total_month));
    setEditCost(String(pkg.total_cost));
    setError(null);
  };

  const cancelEdit = () => {
    setEditingMonth(null);
    setEditMonths("");
    setEditCost("");
  };

  const saveEdit = async () => {
    if (editingMonth === null) return;
    setSavingEdit(true);
    setError(null);
    try {
      const newMonth = Number(editMonths);
      const newCost = Number(editCost);
      if (!Number.isFinite(newMonth) || !Number.isFinite(newCost) || newMonth <= 0 || newCost <= 0) {
        throw new Error("Months and cost must be positive numbers");
      }

      const res = await fetch("/api/package", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          total_month: editingMonth,
          new_total_month: newMonth,
          total_cost: newCost,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update package");
      }

      setPackages((curr) =>
        curr.map((p) =>
          p.total_month === editingMonth ? { total_month: newMonth, total_cost: newCost } : p
        )
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update package");
    } finally {
      setSavingEdit(false);
    }
  };

  const deletePackage = async (month: number) => {
    if (!confirm("Delete this package?")) return;
    setDeletingMonth(month);
    setError(null);
    try {
      const res = await fetch(`/api/package/${month}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete package");
      }
      setPackages((curr) => curr.filter((p) => p.total_month !== month));
      if (editingMonth === month) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete package");
    } finally {
      setDeletingMonth(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-semibold">Packages</div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Months"
          type="number"
          min={1}
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Cost"
          type="number"
          min={0}
          step="0.01"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          required
        />
        <button type="submit" disabled={submitting} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60">
          {submitting ? "Saving..." : "Add Package"}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Months</th>
              <th className="px-4 py-2 text-left">Cost</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>Loading packages...</td>
              </tr>
            ) : sortedPackages.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>No packages found</td>
              </tr>
            ) : (
              sortedPackages.map((p) => (
                <tr key={p.total_month} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {editingMonth === p.total_month ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        type="number"
                        min={1}
                        value={editMonths}
                        onChange={(e) => setEditMonths(e.target.value)}
                      />
                    ) : (
                      `${p.total_month} month${p.total_month === 1 ? "" : "s"}`
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingMonth === p.total_month ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        type="number"
                        min={0}
                        step="0.01"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                      />
                    ) : (
                      `$${p.total_cost.toFixed(2)}`
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {editingMonth === p.total_month ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={savingEdit}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(p)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => deletePackage(p.total_month)}
                          disabled={deletingMonth === p.total_month}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingMonth === p.total_month ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
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
