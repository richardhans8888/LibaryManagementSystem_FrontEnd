import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { BookRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toTinyIntBoolean = (value: unknown): 0 | 1 | null => {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return 1;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return 0;
  }
  return null;
};

//
// ========================================================
// GET /api/books  → list all books (optional category_id filter)
// ========================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category_id");
  const category_id = categoryParam !== null ? toNumber(categoryParam) : null;

  const where = category_id !== null ? "WHERE b.category_id = ?" : "";
  const params = category_id !== null ? [category_id] : [];

  const sql = `
    SELECT 
      b.book_id,
      b.title,
      b.year_published,
      b.book_status,
      b.is_digital,
      b.img_link,
      b.book_desc,
      b.language,
      b.author_id,
      b.category_id,
      b.branch_id,
      a.first_name AS author_first,
      a.last_name AS author_last,
      c.category_name,
      br.branch_name
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    JOIN branch br ON b.branch_id = br.branch_id
    ${where}
    ORDER BY b.book_id DESC;
  `;

  const { rows, error } = await query<BookRow[]>(sql, params);

  if (error || !rows) {
    let fallback = [
      {
        book_id: 1,
        title: "Sample Book",
        year_published: 2024,
        book_status: "available",
        is_digital: 0 as 0 | 1,
        img_link: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
        author_id: 1,
        author_first: "Unknown",
        author_last: "Author",
        category_id: 1,
        category_name: "Fiction",
        branch_id: 1,
        branch_name: "Central",
      },
      {
        book_id: 2,
        title: "Digital Collection",
        year_published: 2023,
        book_status: "available",
        is_digital: 1 as 0 | 1,
        img_link: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop",
        author_id: 2,
        author_first: "Digital",
        author_last: "Curator",
        category_id: 2,
        category_name: "Technology",
        branch_id: 1,
        branch_name: "Central",
      },
    ];
    if (category_id !== null) {
      fallback = fallback.filter((b) => b.category_id === category_id);
    }
    return NextResponse.json(
      { success: true, books: fallback, warning: "Using fallback books due to database timeout" },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true, books: rows });
}

//
// ========================================================
// POST /api/books  → add a book
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();

  const {
    title,
    author_id: rawAuthorId,
    category_id: rawCategoryId,
    year_published: rawYearPublished,
    branch_id: rawBranchId,
    book_status: rawStatus,
    is_digital: rawIsDigital,
    img_link,
    book_desc,
    language,
  } = body;

  const author_id = toNumber(rawAuthorId);
  const category_id = toNumber(rawCategoryId);
  const year_published = toNumber(rawYearPublished);
  const branch_id = toNumber(rawBranchId);
  const book_status = typeof rawStatus === "string" ? rawStatus.trim() : "";
  const is_digital = toTinyIntBoolean(rawIsDigital);

  if (!title || !book_status || !img_link) {
    return NextResponse.json(
      { success: false, error: "Missing required book fields" },
      { status: 400 }
    );
  }

  if (
    author_id === null ||
    category_id === null ||
    year_published === null ||
    branch_id === null ||
    is_digital === null
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required book fields" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO book (
      title,
      author_id,
      category_id,
      year_published,
      branch_id,
      book_status,
      is_digital,
      img_link,
      book_desc,
      language
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    title,
    author_id,
    category_id,
    year_published,
    branch_id,
    book_status,
    is_digital,
    img_link,
    book_desc ?? null,
    language ?? null,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add book" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    book_id: rows.insertId,
  });
}

//
// ========================================================
// PUT /api/books  → update a book
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();

  const {
    book_id: rawBookId,
    title,
    author_id: rawAuthorId,
    category_id: rawCategoryId,
    year_published: rawYearPublished,
    branch_id: rawBranchId,
    book_status: rawStatus,
    is_digital: rawIsDigital,
    img_link,
    book_desc,
    language,
  } = body;

  const book_id = toNumber(rawBookId);
  const author_id = toNumber(rawAuthorId);
  const category_id = toNumber(rawCategoryId);
  const year_published = toNumber(rawYearPublished);
  const branch_id = toNumber(rawBranchId);
  const book_status = typeof rawStatus === "string" ? rawStatus.trim() : "";
  const is_digital = toTinyIntBoolean(rawIsDigital);

  if (!title || !book_status || !img_link) {
    return NextResponse.json(
      { success: false, error: "Missing required fields for book update" },
      { status: 400 }
    );
  }

  if (
    book_id === null ||
    author_id === null ||
    category_id === null ||
    year_published === null ||
    branch_id === null ||
    is_digital === null
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required fields for book update" },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE book
    SET
      title = ?,
      author_id = ?,
      category_id = ?,
      year_published = ?,
      branch_id = ?,
      book_status = ?,
      is_digital = ?,
      img_link = ?,
      book_desc = ?,
      language = ?
    WHERE book_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    title,
    author_id,
    category_id,
    year_published,
    branch_id,
    book_status,
    is_digital,
    img_link,
    book_desc ?? null,
    language ?? null,
    book_id,
  ]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to update book" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Book not found" },
      { status: 404 }
    );
  }

  if (book_status !== "borrowed") {
    await query<ResultSetHeader>(
      `DELETE FROM pickup WHERE book_id = ?;`,
      [book_id]
    ).catch(() => {});
    await query<ResultSetHeader>(
      `DELETE FROM borrowing WHERE book_id = ? AND return_date IS NULL;`,
      [book_id]
    ).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    updated: rows.affectedRows,
  });
}
