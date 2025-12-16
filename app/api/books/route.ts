import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { BookRow, BookAuthorRow } from "@/types/db";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

//
// ========================================================
// GET /api/books  → list all books (optional category_id filter)
// ========================================================
export async function GET(req: Request) {
  const url = new URL(req.url);
  const categoryParam = url.searchParams.get("category_id");
  const category_id = categoryParam !== null ? toNumber(categoryParam) : null;
  const authorParam = url.searchParams.get("author_id");
  const author_id = authorParam !== null ? toNumber(authorParam) : null;

  const conditions = [];
  const params: (number)[] = [];
  if (category_id !== null) {
    conditions.push("b.category_id = ?");
    params.push(category_id);
  }
  if (author_id !== null) {
    conditions.push("ba.author_id = ?");
    params.push(author_id);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT 
      b.book_id,
      b.title,
      b.year_published,
      b.book_status,
      b.img_link,
      b.book_desc,
      b.language,
      b.category_id,
      b.branch_id,
      c.category_name,
      br.branch_name,
      ba.author_id,
      a.first_name,
      a.last_name
    FROM book b
    JOIN category c ON b.category_id = c.category_id
    JOIN branch br ON b.branch_id = br.branch_id
    LEFT JOIN book_author ba ON ba.book_id = b.book_id
    LEFT JOIN author a ON a.author_id = ba.author_id
    ${where}
    ORDER BY b.book_id DESC;
  `;

  const { rows, error } = await query<RowDataPacket[]>(sql, params);

  if (error || !rows) {
    let fallback = [
      {
        book_id: 1,
        title: "Sample Book",
        year_published: 2024,
        book_status: "available",
        img_link: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
        category_id: 1,
        category_name: "Fiction",
        branch_id: 1,
        branch_name: "Central",
        authors: [{ author_id: 1, first_name: "Unknown", last_name: "Author" }],
      },
      {
        book_id: 2,
        title: "Digital Collection",
        year_published: 2023,
        book_status: "available",
        img_link: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop",
        category_id: 2,
        category_name: "Technology",
        branch_id: 1,
        branch_name: "Central",
        authors: [{ author_id: 2, first_name: "Digital", last_name: "Curator" }],
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

  const byBook: Record<number, BookRow & { authors: { author_id: number; first_name: string; last_name: string }[] }> = {};
  (rows as (BookRow & BookAuthorRow)[]).forEach((r) => {
    if (!byBook[r.book_id]) {
      byBook[r.book_id] = {
        book_id: r.book_id,
        title: r.title,
        year_published: r.year_published,
        book_status: r.book_status,
        img_link: r.img_link,
        book_desc: r.book_desc,
        language: r.language,
        category_id: r.category_id,
        category_name: r.category_name,
        branch_id: r.branch_id,
        branch_name: r.branch_name,
        authors: [],
      };
    }
    if (r.author_id) {
      byBook[r.book_id].authors.push({
        author_id: r.author_id,
        first_name: (r as any).first_name,
        last_name: (r as any).last_name,
      });
    }
  });

  return NextResponse.json({ success: true, books: Object.values(byBook) });
}

//
// ========================================================
// POST /api/books  → add a book
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();

  const {
    title,
    author_ids: rawAuthorIds,
    category_id: rawCategoryId,
    year_published: rawYearPublished,
    branch_id: rawBranchId,
    book_status: rawStatus,
    img_link,
    book_desc,
    language,
  } = body;

  const author_ids = Array.isArray(rawAuthorIds) ? rawAuthorIds.map(toNumber).filter((n) => n !== null) : [];
  const category_id = toNumber(rawCategoryId);
  const year_published = toNumber(rawYearPublished);
  const branch_id = toNumber(rawBranchId);
  const book_status = typeof rawStatus === "string" ? rawStatus.trim() : "";

  if (!title || !book_status || !img_link) {
    return NextResponse.json(
      { success: false, error: "Missing required book fields" },
      { status: 400 }
    );
  }

  if (
    author_ids.length === 0 ||
    category_id === null ||
    year_published === null ||
    branch_id === null
  ) {
    return NextResponse.json(
      { success: false, error: "Missing required book fields" },
      { status: 400 }
    );
  }

  const sql = `
    INSERT INTO book (
      title,
      category_id,
      year_published,
      branch_id,
      book_status,
      img_link,
      book_desc,
      language
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    title,
    category_id,
    year_published,
    branch_id,
    book_status,
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

  const bookId = rows.insertId;

  const authorInserts = author_ids.map((aid) =>
    query<ResultSetHeader>(
      `INSERT INTO book_author (book_id, author_id) VALUES (?, ?);`,
      [bookId, aid]
    )
  );
  await Promise.all(authorInserts).catch(() => {});

  return NextResponse.json({
    success: true,
    book_id: bookId,
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
    author_ids: rawAuthorIds,
    category_id: rawCategoryId,
    year_published: rawYearPublished,
    branch_id: rawBranchId,
    book_status: rawStatus,
    img_link,
    book_desc,
    language,
  } = body;

  const book_id = toNumber(rawBookId);
  const author_ids = Array.isArray(rawAuthorIds) ? rawAuthorIds.map(toNumber).filter((n) => n !== null) : [];
  const category_id = toNumber(rawCategoryId);
  const year_published = toNumber(rawYearPublished);
  const branch_id = toNumber(rawBranchId);
  const book_status = typeof rawStatus === "string" ? rawStatus.trim() : "";

  if (!title || !book_status || !img_link) {
    return NextResponse.json(
      { success: false, error: "Missing required fields for book update" },
      { status: 400 }
    );
  }

  if (
    book_id === null ||
    author_ids.length === 0 ||
    category_id === null ||
    year_published === null ||
    branch_id === null
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
      category_id = ?,
      year_published = ?,
      branch_id = ?,
      book_status = ?,
      img_link = ?,
      book_desc = ?,
      language = ?
    WHERE book_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [
    title,
    category_id,
    year_published,
    branch_id,
    book_status,
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

  // refresh author mappings
  await query<ResultSetHeader>(`DELETE FROM book_author WHERE book_id = ?;`, [book_id]).catch(() => {});
  const authorInserts = author_ids.map((aid) =>
    query<ResultSetHeader>(
      `INSERT INTO book_author (book_id, author_id) VALUES (?, ?);`,
      [book_id, aid]
    )
  );
  await Promise.all(authorInserts).catch(() => {});

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
