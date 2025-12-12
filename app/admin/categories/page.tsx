"use client";
import { useEffect, useState } from "react";

type Category = {
  category_id: number;
  category_name: string;
  category_desc: string | null;
};

export default function Page() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/category");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load categories");
      }
      setCategories(data.categories || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_name: name.trim(),
          category_desc: desc.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to add category");
      }
      setCategories((curr) => [
        { category_id: data.category_id, category_name: name.trim(), category_desc: desc.trim() || null },
        ...curr,
      ]);
      setName("");
      setDesc("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c: Category) => {
    setEditingId(c.category_id);
    setEditName(c.category_name);
    setEditDesc(c.category_desc ?? "");
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: editingId,
          category_name: editName.trim(),
          category_desc: editDesc.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update category");
      }
      setCategories((curr) =>
        curr.map((c) =>
          c.category_id === editingId
            ? { ...c, category_name: editName.trim(), category_desc: editDesc.trim() || null }
            : c
        )
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update category");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/category/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete category");
      }
      setCategories((curr) => curr.filter((c) => c.category_id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete category");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Categories</div>
        <div className="text-sm text-black/60">Add, edit, or remove categories</div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Description (optional)"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <button type="submit" disabled={submitting} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60">
          {submitting ? "Saving..." : "Add Category"}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={3}>No categories found</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.category_id} className="border-t border-zinc-100">
                  <td className="px-4 py-2">
                    {editingId === c.category_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      c.category_name
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === c.category_id ? (
                      <input
                        className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                      />
                    ) : (
                      c.category_desc || "—"
                    )}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    {editingId === c.category_id ? (
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
                        <button onClick={() => startEdit(c)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(c.category_id)}
                          disabled={deletingId === c.category_id}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingId === c.category_id ? "Deleting..." : "Delete"}
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
