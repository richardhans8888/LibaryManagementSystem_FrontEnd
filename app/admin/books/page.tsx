"use client";
import { useEffect, useMemo, useState } from "react";

type Author = { author_id: number; first_name: string; last_name: string };
type Category = { category_id: number; category_name: string; category_desc: string | null };
type Branch = { branch_id: number; branch_name: string; branch_address: string };

type BookRow = {
  book_id: number;
  title: string;
  year_published: number;
  book_status: string;
  img_link: string;
  book_desc?: string | null;
  language?: string | null;
  category_id: number;
  category_name: string;
  branch_id: number;
  branch_name: string;
  authors: Author[];
};

const STATUS_OPTIONS = ["available", "reserved", "lost", "borrowed"] as const;
const EDITABLE_STATUS_OPTIONS = ["available", "reserved", "lost"] as const;

type Option = { value: number; label: string };

export default function Page() {
  const [books, setBooks] = useState<BookRow[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [title, setTitle] = useState("");
  const [authorIds, setAuthorIds] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [status] = useState<(typeof STATUS_OPTIONS)[number]>("available");
  const [year, setYear] = useState("");
  const [imgLink, setImgLink] = useState("");
  const [bookDesc, setBookDesc] = useState("");
  const [language, setLanguage] = useState("");

  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBook, setEditBook] = useState<Partial<BookRow>>({});
  const [editAuthorIds, setEditAuthorIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOptions = async () => {
    setLoadingOptions(true);
    setError(null);
    try {
      const [aRes, cRes, bRes] = await Promise.all([
        fetch("/api/author"),
        fetch("/api/category"),
        fetch("/api/branch"),
      ]);
      const [aData, cData, bData] = await Promise.all([aRes.json(), cRes.json(), bRes.json()]);
      if (!aRes.ok || !aData.success) throw new Error(aData.error || "Failed to load authors");
      if (!cRes.ok || !cData.success) throw new Error(cData.error || "Failed to load categories");
      if (!bRes.ok || !bData.success) throw new Error(bData.error || "Failed to load branches");
      setAuthors(aData.authors || []);
      setCategories(cData.categories || []);
      setBranches(bData.branches || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load options");
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadBooks = async () => {
    setLoadingBooks(true);
    setError(null);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load books");
      setBooks(data.books || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load books");
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadOptions();
    loadBooks();
  }, []);

  const authorOptions: Option[] = useMemo(
    () => authors.map((a) => ({ value: a.author_id, label: `${a.first_name} ${a.last_name}` })),
    [authors]
  );
  const categoryOptions: Option[] = useMemo(
    () => categories.map((c) => ({ value: c.category_id, label: c.category_name })),
    [categories]
  );
  const branchOptions: Option[] = useMemo(
    () => branches.map((b) => ({ value: b.branch_id, label: b.branch_name })),
    [branches]
  );

  const onAuthorChange = (vals: number[]) => setAuthorIds(vals);
  const onEditAuthorChange = (vals: number[]) => setEditAuthorIds(vals);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (authorIds.length === 0 || !categoryId || !branchId || !year || !title.trim() || !imgLink.trim()) {
        throw new Error("Please fill all required fields");
      }
      const payload = {
        title: title.trim(),
        author_ids: authorIds,
        category_id: categoryId,
        year_published: Number(year),
        branch_id: branchId,
        book_status: "available",
        img_link: imgLink.trim(),
        book_desc: bookDesc.trim() || null,
        language: language.trim() || null,
      };
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to add book");

      const selectedAuthors = authors.filter((a) => authorIds.includes(a.author_id));
      const category = categories.find((c) => c.category_id === categoryId);
      const branch = branches.find((b) => b.branch_id === branchId);

      setBooks((curr) => [
        {
          book_id: data.book_id,
          title: title.trim(),
          year_published: Number(year),
          book_status: "available",
          img_link: imgLink.trim(),
          book_desc: bookDesc.trim() || null,
          language: language.trim() || null,
          authors: selectedAuthors,
          category_id: categoryId,
          category_name: category?.category_name || "",
          branch_id: branchId,
          branch_name: branch?.branch_name || "",
        },
        ...curr,
      ]);

      setTitle("");
      setAuthorIds([]);
      setCategoryId(null);
      setBranchId(null);
      setYear("");
      setImgLink("");
      setBookDesc("");
      setLanguage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add book");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (value: string) => {
    const base = "inline-flex items-center rounded-full px-2 py-1 text-xs";
    if (value === "available") return `${base} bg-green-100`;
    if (value === "reserved") return `${base} bg-amber-100`;
    if (value === "borrowed") return `${base} bg-blue-100`;
    return `${base} bg-zinc-200`;
  };

  const capitalize = (s: string) => (s.length ? s[0].toUpperCase() + s.slice(1) : s);

  const editingStatus = editBook.book_status ?? "available";
  const authorNames = (list: Author[]) => list.map((a) => `${a.first_name} ${a.last_name}`).join(", ");
  const authorNamesByIds = (ids: number[]) =>
    authors
      .filter((a) => ids.includes(a.author_id))
      .map((a) => `${a.first_name} ${a.last_name}`)
      .join(", ");

  const parseMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) =>
    Array.from(e.target.selectedOptions).map((o) => Number(o.value)).filter((n) => !Number.isNaN(n));

  function AuthorMultiSelect({
    value,
    onChange,
    options,
    placeholder = "Select authors",
  }: {
    value: number[];
    onChange: (next: number[]) => void;
    options: Option[];
    placeholder?: string;
  }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
    const display = value.length ? authorNamesByIds(value) : placeholder;

    const toggle = (id: number) => {
      const exists = value.includes(id);
      const next = exists ? value.filter((v) => v !== id) : [...value, id];
      onChange(next);
    };

    return (
      <div className="relative">
        <button
          type="button"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-left text-sm"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block truncate">{display || placeholder}</span>
        </button>
        {open ? (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-zinc-200 bg-white shadow-lg">
            <div className="p-2 border-b border-zinc-200">
              <input
                className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                placeholder="Search authors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((o) => (
                <label key={o.value} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50">
                  <input
                    type="checkbox"
                    checked={value.includes(o.value)}
                    onChange={() => toggle(o.value)}
                  />
                  {o.label}
                </label>
              ))}
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-xs text-black/60">No authors found</div>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-zinc-200">
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs text-black/70 hover:bg-zinc-100"
                onClick={() => {
                  onChange([]);
                  setSearch("");
                }}
              >
                Clear
              </button>
              <button
                type="button"
                className="rounded-lg bg-zinc-900 px-3 py-1 text-xs text-white"
                onClick={() => setOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Books</div>
        <div className="text-sm text-black/60">Manage catalog entries and authors.</div>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="number"
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Year published"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <AuthorMultiSelect value={authorIds} onChange={onAuthorChange} options={authorOptions} />
        </div>
        <select
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value) || null)}
          required
        >
          <option value="">Select category</option>
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          value={branchId ?? ""}
          onChange={(e) => setBranchId(Number(e.target.value) || null)}
          required
        >
          <option value="">Select branch</option>
          {branchOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Image URL"
          value={imgLink}
          onChange={(e) => setImgLink(e.target.value)}
          required
        />
        <input
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
        <textarea
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm sm:col-span-2 lg:col-span-3"
          placeholder="Description"
          value={bookDesc}
          onChange={(e) => setBookDesc(e.target.value)}
        />
        <button type="submit" disabled={submitting} className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60">
          {submitting ? "Saving..." : "Add Book"}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Authors</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingBooks ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={7}>Loading books...</td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={7}>No books found</td>
              </tr>
            ) : (
              books.map((b) =>
                editingId === b.book_id ? (
                  <tr key={b.book_id} className="border-t border-zinc-100">
                    <td className="px-4 py-3" colSpan={7}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.title ?? b.title}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, title: e.target.value }))}
                        />
                        <input
                          type="number"
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.year_published ?? b.year_published}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, year_published: Number(e.target.value) }))}
                        />
                        <AuthorMultiSelect
                          value={editAuthorIds}
                          onChange={onEditAuthorChange}
                          options={authorOptions}
                          placeholder="Select authors"
                        />
                        <select
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.category_id ?? b.category_id}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, category_id: Number(e.target.value) }))}
                        >
                          {categoryOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.branch_id ?? b.branch_id}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, branch_id: Number(e.target.value) }))}
                        >
                          {branchOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editingStatus}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, book_status: e.target.value }))}
                        >
                          {EDITABLE_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {capitalize(s)}
                            </option>
                          ))}
                        </select>
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.img_link ?? b.img_link}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, img_link: e.target.value }))}
                          placeholder="Image URL"
                        />
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.language ?? b.language ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, language: e.target.value }))}
                          placeholder="Language"
                        />
                        <textarea
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm lg:col-span-3"
                          value={editBook.book_desc ?? b.book_desc ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, book_desc: e.target.value }))}
                          placeholder="Description"
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={async () => {
                            if (editingId === null) return;
                            setSavingEdit(true);
                            setError(null);
                            try {
                              const res = await fetch("/api/books", {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  book_id: editingId,
                                  title: editBook.title ?? b.title,
                                  author_ids: editAuthorIds.length ? editAuthorIds : b.authors.map((a) => a.author_id),
                                  category_id: editBook.category_id ?? b.category_id,
                                  year_published: editBook.year_published ?? b.year_published,
                                  branch_id: editBook.branch_id ?? b.branch_id,
                                  book_status: editBook.book_status ?? b.book_status,
                                  img_link: editBook.img_link ?? b.img_link,
                                  book_desc: editBook.book_desc ?? b.book_desc,
                                  language: editBook.language ?? b.language,
                                }),
                              });
                              const data = await res.json();
                              if (!res.ok || !data.success) throw new Error(data.error || "Failed to update book");
                              const updatedAuthors = authors.filter((a) => (editAuthorIds.length ? editAuthorIds : b.authors.map((au) => au.author_id)).includes(a.author_id));
                              setBooks((curr) =>
                                curr.map((bk) =>
                                  bk.book_id === editingId
                                    ? {
                                        ...bk,
                                        title: editBook.title ?? bk.title,
                                        year_published: editBook.year_published ?? bk.year_published,
                                        category_id: editBook.category_id ?? bk.category_id,
                                        category_name:
                                          categories.find((c) => c.category_id === (editBook.category_id ?? bk.category_id))?.category_name ?? bk.category_name,
                                        branch_id: editBook.branch_id ?? bk.branch_id,
                                        branch_name:
                                          branches.find((br) => br.branch_id === (editBook.branch_id ?? bk.branch_id))?.branch_name ?? bk.branch_name,
                                        book_status: editBook.book_status ?? bk.book_status,
                                        img_link: editBook.img_link ?? bk.img_link,
                                        book_desc: editBook.book_desc ?? bk.book_desc,
                                        language: editBook.language ?? bk.language,
                                        authors: updatedAuthors,
                                      }
                                    : bk
                                )
                              );
                              setEditingId(null);
                              setEditBook({});
                              setEditAuthorIds([]);
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "Failed to update book");
                            } finally {
                              setSavingEdit(false);
                            }
                          }}
                          disabled={savingEdit}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {savingEdit ? "Saving..." : "Save"}
                        </button>
                        <button onClick={() => { setEditingId(null); setEditBook({}); setEditAuthorIds([]); }} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (!confirm("Delete this book?")) return;
                            setDeletingId(b.book_id);
                            setError(null);
                            fetch(`/api/books/${b.book_id}`, { method: "DELETE" })
                              .then((res) => res.json().then((data) => ({ res, data })))
                              .then(({ res, data }) => {
                                if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete book");
                                setBooks((curr) => curr.filter((bk) => bk.book_id !== b.book_id));
                              })
                              .catch((e) => setError(e instanceof Error ? e.message : "Failed to delete book"))
                              .finally(() => setDeletingId(null));
                          }}
                          disabled={deletingId === b.book_id}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingId === b.book_id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={b.book_id} className="border-t border-zinc-100">
                    <td className="px-4 py-2">{b.title}</td>
                    <td className="px-4 py-2">{authorNames(b.authors)}</td>
                    <td className="px-4 py-2">{b.category_name}</td>
                    <td className="px-4 py-2">{b.branch_name}</td>
                    <td className="px-4 py-2">{b.year_published}</td>
                    <td className="px-4 py-2">
                      <span className={statusBadge(b.book_status)}>{b.book_status}</span>
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(b.book_id);
                          setEditBook({});
                          setEditAuthorIds(b.authors.map((a) => a.author_id));
                        }}
                        className="rounded-xl border border-zinc-300 px-3 py-1 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm("Delete this book?")) return;
                          setDeletingId(b.book_id);
                          setError(null);
                          fetch(`/api/books/${b.book_id}`, { method: "DELETE" })
                            .then((res) => res.json().then((data) => ({ res, data })))
                            .then(({ res, data }) => {
                              if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete book");
                              setBooks((curr) => curr.filter((bk) => bk.book_id !== b.book_id));
                            })
                            .catch((e) => setError(e instanceof Error ? e.message : "Failed to delete book"))
                            .finally(() => setDeletingId(null));
                        }}
                        disabled={deletingId === b.book_id}
                        className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                      >
                        {deletingId === b.book_id ? "Deleting..." : "Delete"}
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
  );
}
