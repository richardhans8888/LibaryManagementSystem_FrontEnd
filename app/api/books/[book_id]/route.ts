import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";

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
