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

// Helper: validate and extract numeric ID (fallback to URL if params are missing)
function extractBookId(
  params: { book_id?: string | string[] } | undefined,
  url?: string
) {
  const raw =
    params && "book_id" in params
      ? Array.isArray(params.book_id)
        ? params.book_id[0]
        : params.book_id
      : undefined;

  const fromParams = raw !== undefined ? Number.parseInt(raw, 10) : NaN;

  if (!Number.isNaN(fromParams)) {
    return fromParams;
  }

  if (url) {
    const maybeId = url.split("/").filter(Boolean).pop() ?? "";
    const fromUrl = Number.parseInt(maybeId, 10);
    if (!Number.isNaN(fromUrl)) {
      return fromUrl;
    }
  }

  return null;
}

// ========================================================
// GET /api/books/[book_id] → get a specific book
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { book_id: string | string[] } }
) {
  const bookId = extractBookId(params, req.url);

  if (bookId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid book ID" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT 
      b.book_id,
      b.title,
      CONCAT(a.first_name, ' ', a.last_name) AS author_name,
      c.category_name,
      b.year_published,
      br.branch_name,
      b.book_status,
      b.is_digital,
      b.img_link
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    JOIN branch br ON b.branch_id = br.branch_id
    WHERE b.book_id = ?;
  `;

  const { rows, error } = await query<BookRow[]>(sql, [bookId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows || rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "Book not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, book: rows[0] });
}

// ========================================================
// DELETE /api/books/[book_id] → delete a specific book
// ========================================================
export async function DELETE(
  req: Request,
  { params }: { params: { book_id: string | string[] } }
) {
  const bookId = extractBookId(params, req.url);

  if (bookId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid book ID" },
      { status: 400 }
    );
  }

  const sql = `
    DELETE FROM book
    WHERE book_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [bookId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to delete book" },
      { status: 500 }
    );
  }

  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Book not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Book with ID ${bookId} deleted successfully`,
  });
}

// ========================================================
// PUT /api/books/[book_id] → update a specific book
// ========================================================
export async function PUT(
  req: Request,
  { params }: { params: { book_id: string | string[] } }
) {
  const bookId = extractBookId(params, req.url);

  if (bookId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid book ID" },
      { status: 400 }
    );
  }

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
  } = body;

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
      img_link = ?
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
    bookId,
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

  return NextResponse.json({
    success: true,
    updated: rows.affectedRows,
  });
}
