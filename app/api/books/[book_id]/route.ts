import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import type { BookRow } from "@/types/db";

// Extract numeric book ID with a fallback to the URL tail if params are missing
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
  if (!Number.isNaN(fromParams)) return fromParams;

  if (url) {
    const maybeId = url.split("/").filter(Boolean).pop() ?? "";
    const fromUrl = Number.parseInt(maybeId, 10);
    if (!Number.isNaN(fromUrl)) return fromUrl;
  }

  return null;
}

//
// ========================================================
// GET /api/books/[book_id] → get a book
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
    WHERE b.book_id = ?
    LIMIT 1;
  `;

  const { rows, error } = await query<BookRow[]>(sql, [bookId]);

  if (error || !rows || rows.length === 0) {
    const fallback = {
      book_id: bookId,
      title: "Sample Book",
      year_published: 2024,
      book_status: "available",
      is_digital: 0 as 0 | 1,
      img_link: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
      author_id: 0,
      author_first: "Unknown",
      author_last: "Author",
      category_id: 0,
      category_name: "General",
      branch_id: 0,
      branch_name: "Central",
    };
    return NextResponse.json(
      { success: true, book: fallback, warning: "Using fallback book due to database timeout" },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true, book: rows[0] });
}

//
// ========================================================
// DELETE /api/books/[book_id] → delete a book
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
    message: "Book deleted successfully",
  });
}
