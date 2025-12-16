"use client";
import { useEffect, useMemo, useState } from "react";

type Branch = {
  branch_id: number;
  branch_name: string;
};

type Staff = {
  staff_id: number;
  first_name: string;
  last_name: string;
  staff_role: string;
  phone_number: string | null;
  email: string | null;
  branch_id: number;
  branch_name: string | null;
};

export default function Page() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [branchId, setBranchId] = useState("");

  const [editStaff, setEditStaff] = useState<Partial<Staff>>({});

  const sortedStaff = useMemo(
    () => [...staff].sort((a, b) => a.last_name.localeCompare(b.last_name) || a.first_name.localeCompare(b.first_name)),
    [staff]
  );

  const loadBranches = async () => {
    setLoadingBranches(true);
    setError(null);
    try {
      const res = await fetch("/api/branch");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load branches");
      }
      setBranches(data.branches || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load branches");
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadStaff = async () => {
    setLoadingStaff(true);
    setError(null);
    try {
      const res = await fetch("/api/staff");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load staff");
      }
      setStaff(data.staff || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load staff");
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    loadBranches();
    loadStaff();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        staff_role: role.trim(),
        phone_number: phone.trim() || null,
        email: email.trim() || null,
        branch_id: Number(branchId),
      };

      if (!payload.first_name || !payload.last_name || !payload.staff_role || Number.isNaN(payload.branch_id)) {
        throw new Error("First name, last name, role, and branch are required");
      }

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add staff");
      }

      const branchName = branches.find((b) => b.branch_id === payload.branch_id)?.branch_name ?? null;

      setStaff((curr) => [
        {
          staff_id: data.staff_id,
          first_name: payload.first_name,
          last_name: payload.last_name,
          staff_role: payload.staff_role,
          phone_number: payload.phone_number,
          email: payload.email,
          branch_id: payload.branch_id,
          branch_name: branchName,
        },
        ...curr,
      ]);

      setFirstName("");
      setLastName("");
      setRole("");
      setPhone("");
      setEmail("");
      setBranchId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add staff");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (s: Staff) => {
    setEditingId(s.staff_id);
    setEditStaff({ ...s });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStaff({});
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingEdit(true);
    setError(null);
    try {
      const payload = {
        staff_id: editingId,
        first_name: editStaff.first_name?.trim() ?? "",
        last_name: editStaff.last_name?.trim() ?? "",
        staff_role: editStaff.staff_role?.trim() ?? "",
        phone_number: (editStaff.phone_number ?? "").toString().trim() || null,
        email: (editStaff.email ?? "").toString().trim() || null,
        branch_id: Number(editStaff.branch_id),
      };

      if (!payload.first_name || !payload.last_name || !payload.staff_role || Number.isNaN(payload.branch_id)) {
        throw new Error("First name, last name, role, and branch are required");
      }

      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update staff");
      }

      const branchName = branches.find((b) => b.branch_id === payload.branch_id)?.branch_name ?? null;

      setStaff((curr) =>
        curr.map((s) =>
          s.staff_id === editingId
            ? {
                ...s,
                first_name: payload.first_name,
                last_name: payload.last_name,
                staff_role: payload.staff_role,
                phone_number: payload.phone_number,
                email: payload.email,
                branch_id: payload.branch_id,
                branch_name: branchName,
              }
            : s
        )
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update staff");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteStaff = async (id: number) => {
    if (!confirm("Delete this staff member?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete staff");
      }
      setStaff((curr) => curr.filter((s) => s.staff_id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete staff");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="text-xl font-semibold">Staff</div>
        <div className="text-sm text-black/60">
          Manage all staff across branches. Use this to keep branch assignments and contact details up to date.
        </div>
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
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <select
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          required
          disabled={loadingBranches}
        >
          <option value="">{loadingBranches ? "Loading branches..." : "Branch"}</option>
          {branches.map((b) => (
            <option key={b.branch_id} value={b.branch_id}>
              {b.branch_name}
            </option>
          ))}
        </select>
        <button type="submit" disabled={submitting} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60">
          {submitting ? "Saving..." : "Add Staff"}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingStaff ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={6}>Loading staff...</td>
              </tr>
            ) : sortedStaff.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={6}>No staff found</td>
              </tr>
            ) : (
              sortedStaff.map((s) => (
                <tr key={s.staff_id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {editingId === s.staff_id ? (
                      <div className="flex gap-2">
                        <input
                          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editStaff.first_name ?? ""}
                          onChange={(e) => setEditStaff((curr) => ({ ...curr, first_name: e.target.value }))}
                        />
                        <input
                          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editStaff.last_name ?? ""}
                          onChange={(e) => setEditStaff((curr) => ({ ...curr, last_name: e.target.value }))}
                        />
                      </div>
                    ) : (
                      `${s.first_name} ${s.last_name}`
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === s.staff_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editStaff.staff_role ?? ""}
                        onChange={(e) => setEditStaff((curr) => ({ ...curr, staff_role: e.target.value }))}
                      />
                    ) : (
                      s.staff_role
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === s.staff_id ? (
                      <select
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={String(editStaff.branch_id ?? "")}
                        onChange={(e) => setEditStaff((curr) => ({ ...curr, branch_id: Number(e.target.value) }))}
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => (
                          <option key={b.branch_id} value={b.branch_id}>
                            {b.branch_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      s.branch_name ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === s.staff_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editStaff.phone_number ?? ""}
                        onChange={(e) => setEditStaff((curr) => ({ ...curr, phone_number: e.target.value }))}
                      />
                    ) : (
                      s.phone_number || "-"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === s.staff_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        type="email"
                        value={editStaff.email ?? ""}
                        onChange={(e) => setEditStaff((curr) => ({ ...curr, email: e.target.value }))}
                      />
                    ) : (
                      s.email || "-"
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {editingId === s.staff_id ? (
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
                        <button onClick={() => startEdit(s)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStaff(s.staff_id)}
                          disabled={deletingId === s.staff_id}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingId === s.staff_id ? "Deleting..." : "Delete"}
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
