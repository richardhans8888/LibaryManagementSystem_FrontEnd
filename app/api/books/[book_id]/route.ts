import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import { BookRow } from "@/types/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ book_id: string | string[] }> }
) {
  const { book_id } = await params;

  const idParam = Array.isArray(book_id) ? book_id[0] : book_id;
  const bookId = Number.parseInt(idParam, 10);

  if (Number.isNaN(bookId)) {
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

      a.first_name AS author_first,
      a.last_name AS author_last,

      c.category_name,

      br.branch_name
    FROM book b
    JOIN author a ON b.author_id = a.author_id
    JOIN category c ON b.category_id = c.category_id
    JOIN branch br ON b.branch_id = br.branch_id
    WHERE b.book_id = ?;
  `;

  const { rows, error } = await query<BookRow>(sql, [bookId]);

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
