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
  is_digital: 0 | 1;
  img_link: string;
  book_desc?: string | null;
  language?: string | null;
  author_id: number;
  author_first: string;
  author_last: string;
  category_id: number;
  category_name: string;
  branch_id: number;
  branch_name: string;
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
  const [authorId, setAuthorId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [status] = useState<(typeof STATUS_OPTIONS)[number]>("available");
  const [isDigital, setIsDigital] = useState(false);
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!authorId || !categoryId || !branchId || !year || !title.trim() || !imgLink.trim()) {
        throw new Error("Please fill all required fields");
      }
      const payload = {
        title: title.trim(),
        author_id: authorId,
        category_id: categoryId,
        year_published: Number(year),
        branch_id: branchId,
        book_status: "available",
        is_digital: isDigital ? 1 : 0,
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

      const author = authors.find((a) => a.author_id === authorId);
      const category = categories.find((c) => c.category_id === categoryId);
      const branch = branches.find((b) => b.branch_id === branchId);

      setBooks((curr) => [
        {
          book_id: data.book_id,
          title: title.trim(),
          year_published: Number(year),
          book_status: "available",
          is_digital: isDigital ? 1 : 0,
          img_link: imgLink.trim(),
          book_desc: bookDesc.trim() || null,
          language: language.trim() || null,
          author_id: authorId,
          author_first: author?.first_name || "",
          author_last: author?.last_name || "",
          category_id: categoryId,
          category_name: category?.category_name || "",
          branch_id: branchId,
          branch_name: branch?.branch_name || "",
        },
        ...curr,
      ]);

      setTitle("");
      setAuthorId(null);
      setCategoryId(null);
      setBranchId(null);
      setIsDigital(false);
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

  function SearchableDropdown({
    placeholder,
    options,
    value,
    onChange,
    disabled,
  }: {
    placeholder: string;
    options: Option[];
    value: number | null;
    onChange: (val: number | null) => void;
    disabled?: boolean;
  }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const filtered = options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));
    const selected = options.find((o) => o.value === value);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setOpen((v) => !v)}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm text-left disabled:opacity-60"
          disabled={disabled}
        >
          {selected ? selected.label : placeholder}
        </button>
        {open ? (
          <div className="absolute z-10 mt-1 w-full rounded-xl border border-zinc-300 bg-white shadow-sm">
            <input
              autoFocus
              className="w-full border-b border-zinc-200 px-3 py-2 text-sm"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-black/60">No matches</div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-zinc-50"
                    onClick={() => {
                      onChange(opt.value);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  const startEdit = (b: BookRow) => {
    setEditingId(b.book_id);
    setEditBook({
      ...b,
      is_digital: b.is_digital,
      book_status: b.book_status,
      author_id: b.author_id,
      category_id: b.category_id,
      branch_id: b.branch_id,
    });
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBook({});
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setSavingEdit(true);
    setError(null);
    try {
    const payload = {
      book_id: editingId,
      title: editBook.title?.trim(),
      author_id: editBook.author_id,
      category_id: editBook.category_id,
      year_published: editBook.year_published,
      branch_id: editBook.branch_id,
      book_status: editBook.book_status,
      is_digital: editBook.is_digital,
      img_link: editBook.img_link?.trim(),
      book_desc: (editBook.book_desc ?? "").toString().trim() || null,
      language: (editBook.language ?? "").toString().trim() || null,
    };
      if (
        !payload.title ||
        payload.author_id === undefined ||
        payload.category_id === undefined ||
        payload.year_published === undefined ||
        payload.branch_id === undefined ||
        !payload.book_status ||
        payload.is_digital === undefined ||
        !payload.img_link
      ) {
        throw new Error("Please fill all required fields");
      }
      const res = await fetch("/api/books", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update book");

      const author = authors.find((a) => a.author_id === payload.author_id);
      const category = categories.find((c) => c.category_id === payload.category_id);
      const branch = branches.find((b) => b.branch_id === payload.branch_id);

      setBooks((curr) =>
        curr.map((b) =>
          b.book_id === editingId
            ? {
                ...b,
                title: payload.title!,
                year_published: Number(payload.year_published),
                book_status: payload.book_status!,
                is_digital: payload.is_digital as 0 | 1,
                img_link: payload.img_link!,
                book_desc: payload.book_desc ?? null,
                language: payload.language ?? null,
                author_id: payload.author_id!,
                author_first: author?.first_name || b.author_first,
                author_last: author?.last_name || b.author_last,
                category_id: payload.category_id!,
                category_name: category?.category_name || b.category_name,
                branch_id: payload.branch_id!,
                branch_name: branch?.branch_name || b.branch_name,
              }
            : b
        )
      );
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update book");
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteBook = async (id: number) => {
    if (!confirm("Delete this book?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete book");
      setBooks((curr) => curr.filter((b) => b.book_id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete book");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold">Books</div>
        <div className="text-sm text-black/60">Create books using existing authors, categories, and branches.</div>
      </div>

      <form onSubmit={submit} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <SearchableDropdown
            placeholder="Select Author"
            options={authorOptions}
            value={authorId}
            onChange={setAuthorId}
            disabled={loadingOptions}
          />

          <SearchableDropdown
            placeholder="Select Category"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            disabled={loadingOptions}
          />

          <SearchableDropdown
            placeholder="Select Branch"
            options={branchOptions}
            value={branchId}
            onChange={setBranchId}
            disabled={loadingOptions}
          />

          <select
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            value={isDigital ? "digital" : "physical"}
            onChange={(e) => setIsDigital(e.target.value === "digital")}
          >
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
          </select>

          <input
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Year Published"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />

          <div className="rounded-xl border border-zinc-300 px-3 py-2 text-sm bg-zinc-50">Status: Available</div>

          <input
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm lg:col-span-2"
            placeholder="Image Link"
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
            className="rounded-xl border border-zinc-300 px-3 py-2 text-sm lg:col-span-3 min-h-[96px]"
            placeholder="Description"
            value={bookDesc}
            onChange={(e) => setBookDesc(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || loadingOptions}
          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Add Book"}
        </button>
      </form>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-2 text-left">Title</th>
              <th className="px-4 py-2 text-left">Author</th>
              <th className="px-4 py-2 text-left">Category</th>
              <th className="px-4 py-2 text-left">Branch</th>
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-left">Format</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Image</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingBooks ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={9}>Loading books...</td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td className="px-4 py-3 text-black/60" colSpan={9}>No books found</td>
              </tr>
            ) : (
              books.map((b) =>
                editingId === b.book_id ? (
                  <tr key={b.book_id} className="border-t border-zinc-100">
                    <td className="px-4 py-3" colSpan={9}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.title ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, title: e.target.value }))}
                          placeholder="Title"
                        />
                        <SearchableDropdown
                          placeholder="Select author"
                          options={authorOptions}
                          value={editBook.author_id ?? null}
                          onChange={(val) => setEditBook((curr) => ({ ...curr, author_id: val ?? undefined }))}
                          disabled={loadingOptions}
                        />
                        <SearchableDropdown
                          placeholder="Select category"
                          options={categoryOptions}
                          value={editBook.category_id ?? null}
                          onChange={(val) => setEditBook((curr) => ({ ...curr, category_id: val ?? undefined }))}
                          disabled={loadingOptions}
                        />
                        <SearchableDropdown
                          placeholder="Select branch"
                          options={branchOptions}
                          value={editBook.branch_id ?? null}
                          onChange={(val) => setEditBook((curr) => ({ ...curr, branch_id: val ?? undefined }))}
                          disabled={loadingOptions}
                        />
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.year_published ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, year_published: Number(e.target.value) }))}
                          placeholder="Year"
                        />
                        <select
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.is_digital ? "digital" : "physical"}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, is_digital: e.target.value === "digital" ? 1 : 0 }))}
                        >
                          <option value="physical">Physical</option>
                          <option value="digital">Digital</option>
                        </select>
                        <select
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.book_status ?? b.book_status}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, book_status: e.target.value }))}
                        >
                          {EDITABLE_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {capitalize(s)}
                            </option>
                          ))}
                          <option value="borrowed" disabled>
                            Borrowed (Automatic)
                          </option>
                        </select>
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm lg:col-span-2"
                          value={editBook.img_link ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, img_link: e.target.value }))}
                          placeholder="Image Link"
                        />
                        <input
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                          value={editBook.language ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, language: e.target.value }))}
                          placeholder="Language"
                        />
                        <textarea
                          className="rounded-xl border border-zinc-300 px-3 py-2 text-sm lg:col-span-2 min-h-[96px]"
                          value={editBook.book_desc ?? ""}
                          onChange={(e) => setEditBook((curr) => ({ ...curr, book_desc: e.target.value }))}
                          placeholder="Description"
                        />
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
                          onClick={() => deleteBook(b.book_id)}
                          disabled={deletingId === b.book_id}
                          className="rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-60"
                        >
                          {deletingId === b.book_id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={b.book_id} className="border-t border-zinc-100">
                    <td className="px-4 py-2">{b.title}</td>
                    <td className="px-4 py-2">{b.author_first} {b.author_last}</td>
                    <td className="px-4 py-2">{b.category_name}</td>
                    <td className="px-4 py-2">{b.branch_name}</td>
                    <td className="px-4 py-2">{b.year_published}</td>
                    <td className="px-4 py-2">{b.is_digital ? "Digital" : "Physical"}</td>
                    <td className="px-4 py-2">
                      <span className={statusBadge(b.book_status)}>{capitalize(b.book_status)}</span>
                    </td>
                    <td className="px-4 py-2 truncate max-w-[12rem]">
                      <a href={b.img_link} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                        {b.img_link}
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => startEdit(b)} className="rounded-xl border border-zinc-300 px-3 py-1 text-sm">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBook(b.book_id)}
                          disabled={deletingId === b.book_id}
                          className="rounded-xl border border-zinc-300 px-3 py-1 text-sm disabled:opacity-60"
                        >
                          {deletingId === b.book_id ? "Deleting..." : "Delete"}
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
