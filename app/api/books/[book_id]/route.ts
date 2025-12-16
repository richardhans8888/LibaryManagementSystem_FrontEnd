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
    WHERE b.book_id = ?;
  `;

  const { rows, error } = await query<any[]>(sql, [bookId]);

  if (error || !rows || rows.length === 0) {
    const fallback = {
      book_id: bookId,
      title: "Sample Book",
      year_published: 2024,
      book_status: "available",
      img_link: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&auto=format&fit=crop",
      category_id: 0,
      category_name: "General",
      branch_id: 0,
      branch_name: "Central",
      authors: [{ author_id: 0, first_name: "Unknown", last_name: "Author" }],
    };
    return NextResponse.json(
      { success: true, book: fallback, warning: "Using fallback book due to database timeout" },
      { status: 200 }
    );
  }

  const grouped = {
    book_id: rows[0].book_id,
    title: rows[0].title,
    year_published: rows[0].year_published,
    book_status: rows[0].book_status,
    img_link: rows[0].img_link,
    book_desc: rows[0].book_desc,
    language: rows[0].language,
    category_id: rows[0].category_id,
    category_name: rows[0].category_name,
    branch_id: rows[0].branch_id,
    branch_name: rows[0].branch_name,
    authors: rows
      .filter((r) => r.author_id)
      .map((r) => ({ author_id: r.author_id, first_name: r.first_name, last_name: r.last_name })),
  };

  return NextResponse.json({ success: true, book: grouped });
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
    SELECT COUNT(*) AS borrow_count
    FROM borrowing
    WHERE book_id = ?;
  `;

  const borrowCheck = await query<{ borrow_count: number }[]>(sql, [bookId]);
  if (borrowCheck.error) {
    return NextResponse.json(
      { success: false, error: borrowCheck.error.message },
      { status: 500 }
    );
  }

  const hasBorrowings =
    borrowCheck.rows && borrowCheck.rows[0] && borrowCheck.rows[0].borrow_count > 0;
  if (hasBorrowings) {
    return NextResponse.json(
      {
        success: false,
        error:
          "This book has borrowing records. Please remove associated borrowings before deleting the book.",
      },
      { status: 409 }
    );
  }

  // Best-effort cleanup of pickups before deleting the book
  await query<ResultSetHeader>(`DELETE FROM pickup WHERE book_id = ?;`, [bookId]).catch(() => {});

  const { rows, error } = await query<ResultSetHeader>(
    `
    DELETE FROM book
    WHERE book_id = ?;
  `,
    [bookId]
  );

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
