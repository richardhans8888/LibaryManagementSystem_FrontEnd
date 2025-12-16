"use client";
import { useEffect, useMemo, useState } from "react";

type Member = {
  member_id: number;
  first_name: string;
  last_name: string;
  address: string | null;
  phone_number: string | null;
  email: string | null;
  password: string | null;
  membership_start_date: string;
  membership_end_date: string | null;
  blacklisted_at: string | null;
};

export default function Page() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [action, setAction] = useState<"blacklist" | "reactivate" | null>(null);
  const [reason, setReason] = useState("");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const derivedStatus = (m: Member) => {
    if (!m.membership_end_date) return "active";
    const end = new Date(m.membership_end_date);
    end.setHours(0, 0, 0, 0);
    return end >= today ? "active" : "expired";
  };

  const verifiedMembers = useMemo(
    () => [...members].filter((m) => !m.blacklisted_at).sort((a, b) => a.last_name.localeCompare(b.last_name)),
    [members]
  );
  const blacklistedMembers = useMemo(
    () => [...members].filter((m) => m.blacklisted_at).sort((a, b) => a.last_name.localeCompare(b.last_name)),
    [members]
  );

  const loadMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/member");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load members");
      setMembers(data.members || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const startEdit = (m: Member) => {
    setEditingId(m.member_id);
    setAction(m.blacklisted_at ? "reactivate" : "blacklist");
    setReason("");
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setAction(null);
    setReason("");
  };

  const saveEdit = async () => {
    if (editingId === null || !action) return;
    if (action === "blacklist" && !reason.trim()) {
      setError("Reason is required to blacklist a member");
      return;
    }
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/member/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update member");

      setMembers((curr) =>
        curr.map((m) =>
          m.member_id === editingId
            ? { ...m, blacklisted_at: action === "blacklist" ? new Date().toISOString() : null }
            : m
        )
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update member");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteMember = async (id: number) => {
    if (!confirm("Delete this member?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/member/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete member");
      setMembers((curr) => curr.filter((m) => m.member_id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete member");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Members</div>
        <div className="text-sm text-black/60">Self-signup manages profile data. Admins can only blacklist/reactivate accounts.</div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Address</th>
              <th className="px-4 py-2 text-left">Start</th>
              <th className="px-4 py-2 text-left">End</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={8}>Loading members...</td>
              </tr>
            ) : verifiedMembers.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={8}>No members found</td>
              </tr>
            ) : (
              verifiedMembers.map((m) =>
                editingId === m.member_id ? (
                  <tr key={m.member_id} className="border-t border-zinc-100">
                    <td className="px-4 py-3" colSpan={8}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="lg:col-span-3 text-sm text-black/60">
                          Provide a reason to blacklist this member.
                        </div>
                        <div className="lg:col-span-3">
                          <textarea
                            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                            placeholder="Reason for blacklisting"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={saveEdit}
                          disabled={savingEdit || !reason.trim()}
                          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button onClick={cancelEdit} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">
                          Cancel
                        </button>
                        <button
                          onClick={() => deleteMember(m.member_id)}
                          disabled={deletingId === m.member_id}
                          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60"
                        >
                          {deletingId === m.member_id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={m.member_id} className="border-t border-zinc-100">
                    <td className="px-4 py-2">{`${m.first_name} ${m.last_name}`}</td>
                    <td className="px-4 py-2">{m.email || "—"}</td>
                    <td className="px-4 py-2">{m.phone_number || "—"}</td>
                    <td className="px-4 py-2">{m.address || "—"}</td>
                    <td className="px-4 py-2">{m.membership_start_date?.slice(0, 10)}</td>
                    <td className="px-4 py-2">{m.membership_end_date?.slice(0, 10) || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        derivedStatus(m) === "active" ? "bg-green-100" : "bg-amber-100"
                      }`}>
                        {derivedStatus(m).charAt(0).toUpperCase() + derivedStatus(m).slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => startEdit(m)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Blacklist
                        </button>
                        <button
                          onClick={() => deleteMember(m.member_id)}
                          disabled={deletingId === m.member_id}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingId === m.member_id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div className="text-lg font-semibold">Blacklisted Members</div>
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Blacklisted At</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-3 text-black/60" colSpan={4}>Loading...</td>
                </tr>
              ) : blacklistedMembers.length === 0 ? (
                <tr>
                  <td className="px-4 py-3 text-black/60" colSpan={4}>No blacklisted members</td>
                </tr>
              ) : (
                blacklistedMembers.map((m) =>
                  editingId === m.member_id ? (
                    <tr key={m.member_id} className="border-t border-zinc-100">
                      <td className="px-4 py-3" colSpan={4}>
                        <div className="text-sm text-black/70 mb-3">Reactivate this member?</div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={saveEdit}
                            disabled={savingEdit}
                            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60"
                          >
                            {savingEdit ? "Saving..." : "Reactivate"}
                          </button>
                          <button onClick={cancelEdit} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={m.member_id} className="border-t border-zinc-100">
                      <td className="px-4 py-2">{`${m.first_name} ${m.last_name}`}</td>
                      <td className="px-4 py-2">{m.email || "—"}</td>
                      <td className="px-4 py-2">{m.blacklisted_at?.slice(0, 10) || "—"}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => { setEditingId(m.member_id); setAction("reactivate"); setReason(""); }}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm"
                        >
                          Reactivate
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
