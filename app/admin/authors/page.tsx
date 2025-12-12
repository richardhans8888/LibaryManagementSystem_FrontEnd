"use client";
import { useEffect, useState } from "react";

type Author = {
  author_id: number;
  first_name: string;
  last_name: string;
};

export default function Page() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAuthors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/author");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load authors");
      }
      setAuthors(data.authors || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load authors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/author", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add author");
      }
      setFirstName("");
      setLastName("");
      setAuthors((curr) => [
        { author_id: data.author_id, first_name: firstName.trim(), last_name: lastName.trim() },
        ...curr,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add author");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (a: Author) => {
    setEditingId(a.author_id);
    setEditFirst(a.first_name);
    setEditLast(a.last_name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFirst("");
    setEditLast("");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/author/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: editFirst.trim(),
          last_name: editLast.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update author");
      }
      setAuthors((curr) =>
        curr.map((a) =>
          a.author_id === editingId ? { ...a, first_name: editFirst.trim(), last_name: editLast.trim() } : a
        )
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update author");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteAuthor = async (id: number) => {
    if (!confirm("Delete this author?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/author/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete author");
      }
      setAuthors((curr) => curr.filter((a) => a.author_id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete author");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Authors</div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
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
        <button type="submit" disabled={submitting} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60">
          {submitting ? "Saving..." : "Add Author"}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">First Name</th>
              <th className="px-4 py-2 text-left">Last Name</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>Loading authors...</td>
              </tr>
            ) : authors.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>No authors found</td>
              </tr>
            ) : (
              authors.map((a) => (
                <tr key={a.author_id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {editingId === a.author_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editFirst}
                        onChange={(e) => setEditFirst(e.target.value)}
                      />
                    ) : (
                      a.first_name
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === a.author_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editLast}
                        onChange={(e) => setEditLast(e.target.value)}
                      />
                    ) : (
                      a.last_name
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {editingId === a.author_id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={savingEdit}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(a)}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAuthor(a.author_id)}
                          disabled={deletingId === a.author_id}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingId === a.author_id ? "Deleting..." : "Delete"}
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
