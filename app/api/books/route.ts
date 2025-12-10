import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import { BookRow } from "@/types/db";

export async function GET() {
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
    ORDER BY b.book_id ASC;
  `;

  const { rows, error } = await query<BookRow>(sql);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, books: rows });
}
