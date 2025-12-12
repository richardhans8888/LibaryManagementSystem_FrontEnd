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
  member_status: string;
};

const STATUS_OPTIONS = ["active", "expired", "blacklist"] as const;

export default function Page() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status] = useState<(typeof STATUS_OPTIONS)[number]>("active");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMember, setEditMember] = useState<Partial<Member>>({});

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.last_name.localeCompare(b.last_name)),
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!firstName.trim() || !lastName.trim() || !startDate || !status) {
        throw new Error("First name, last name, start date, and status are required");
      }
      if (!password.trim()) {
        throw new Error("Password is required");
      }
      const res = await fetch("/api/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address: address.trim() || null,
          phone_number: phone.trim() || null,
          email: email.trim() || null,
          password: password.trim(),
          membership_start_date: startDate,
          membership_end_date: endDate.trim() || null,
          member_status: status,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add member");

      setMembers((curr) => [
        {
          member_id: data.member_id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address: address.trim() || null,
          phone_number: phone.trim() || null,
          email: email.trim() || null,
          password: null,
          membership_start_date: startDate,
          membership_end_date: endDate.trim() || null,
          member_status: status,
        },
        ...curr,
      ]);

      setFirstName("");
      setLastName("");
      setAddress("");
      setPhone("");
      setEmail("");
      setPassword("");
      setStartDate("");
      setEndDate("");
      // status remains default active on creation
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add member");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (m: Member) => {
    setEditingId(m.member_id);
    setEditMember({ ...m, password: "" });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMember({});
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingEdit(true);
    setError(null);
    try {
      const payload = {
        first_name: editMember.first_name?.trim(),
        last_name: editMember.last_name?.trim(),
        address: (editMember.address ?? "").toString().trim() || null,
        phone_number: (editMember.phone_number ?? "").toString().trim() || null,
        email: (editMember.email ?? "").toString().trim() || null,
        password: (editMember.password ?? "").toString().trim() || null,
        membership_start_date: editMember.membership_start_date,
        membership_end_date: editMember.membership_end_date?.toString().trim() || null,
        member_status: editMember.member_status,
      };
      const res = await fetch(`/api/member/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update member");

      setMembers((curr) =>
        curr.map((m) =>
          m.member_id === editingId
            ? {
                ...m,
                first_name: payload.first_name ?? m.first_name,
                last_name: payload.last_name ?? m.last_name,
                phone_number: payload.phone_number !== undefined ? payload.phone_number : m.phone_number,
                email: payload.email !== undefined ? payload.email : m.email,
                address: payload.address !== undefined ? payload.address : m.address,
                membership_start_date: payload.membership_start_date ?? m.membership_start_date,
                membership_end_date: payload.membership_end_date ?? m.membership_end_date,
                member_status: payload.member_status ?? m.member_status,
              }
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
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="tel"
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="email"
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm sm:col-span-2"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:col-span-2 lg:col-span-3">
          <div>
            <div className="text-xs mb-1">Membership Start Date</div>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <div className="text-xs mb-1">Membership End Date</div>
            <input
              type="date"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="text-xs mb-1">Status</div>
          <input
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm bg-zinc-50"
            value="Active"
            readOnly
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3">
          <button type="submit" disabled={submitting} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60 w-fit">
            {submitting ? "Saving..." : "Add Member"}
          </button>
        </div>
      </form>

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
            ) : sortedMembers.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={8}>No members found</td>
              </tr>
            ) : (
              sortedMembers.map((m) =>
                editingId === m.member_id ? (
                  <tr key={m.member_id} className="border-t border-zinc-100">
                    <td className="px-4 py-3" colSpan={8}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                            value={editMember.first_name ?? ""}
                            onChange={(e) => setEditMember((curr) => ({ ...curr, first_name: e.target.value }))}
                          />
                          <input
                            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                            value={editMember.last_name ?? ""}
                            onChange={(e) => setEditMember((curr) => ({ ...curr, last_name: e.target.value }))}
                          />
                        </div>
                      <input
                        className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editMember.email ?? ""}
                        onChange={(e) => setEditMember((curr) => ({ ...curr, email: e.target.value }))}
                        placeholder="Email"
                      />
                      <input
                        type="password"
                        className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editMember.password ?? ""}
                        onChange={(e) => setEditMember((curr) => ({ ...curr, password: e.target.value }))}
                        placeholder="New password (optional)"
                      />
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editMember.phone_number ?? ""}
                          onChange={(e) => setEditMember((curr) => ({ ...curr, phone_number: e.target.value }))}
                          placeholder="Phone"
                        />
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm lg:col-span-2"
                          value={editMember.address ?? ""}
                          onChange={(e) => setEditMember((curr) => ({ ...curr, address: e.target.value }))}
                          placeholder="Address"
                        />
                        <div>
                          <div className="text-xs mb-1">Start</div>
                          <input
                            type="date"
                            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                            value={editMember.membership_start_date ?? ""}
                            onChange={(e) => setEditMember((curr) => ({ ...curr, membership_start_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs mb-1">End</div>
                          <input
                            type="date"
                            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                            value={editMember.membership_end_date ?? ""}
                            onChange={(e) => setEditMember((curr) => ({ ...curr, membership_end_date: e.target.value }))}
                          />
                        </div>
                        <div>
                          <div className="text-xs mb-1">Status</div>
                          <select
                            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                            value={editMember.member_status ?? m.member_status}
                            onChange={(e) => setEditMember((curr) => ({ ...curr, member_status: e.target.value }))}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={saveEdit}
                          disabled={savingEdit}
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
                        m.member_status === "active"
                          ? "bg-green-100"
                          : m.member_status === "blacklist"
                            ? "bg-rose-100"
                            : "bg-zinc-200"
                      }`}>
                        {m.member_status.charAt(0).toUpperCase() + m.member_status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => startEdit(m)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Edit
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
    </div>
  );
}
