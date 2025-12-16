import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

type BorrowingRow = RowDataPacket & {
  borrowing_id: number;
  book_id: number;
  member_id: number;
  borrowed_at: string;
  due_date: string;
  return_date: string | null;
  title: string;
  member_name: string;
  staff_id: number | null;
  staff_name: string | null;
  staff_branch: string | null;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const view = url.searchParams.get("view"); // active | history | all
  const where =
    view === "active"
      ? "WHERE br.return_date IS NULL"
      : view === "history"
        ? "WHERE br.return_date IS NOT NULL"
        : "";

  const sql = `
    SELECT
      br.borrowing_id,
      br.book_id,
      br.member_id,
      br.borrowed_at,
      br.due_date,
      br.return_date,
      b.title,
      CONCAT(m.first_name, ' ', m.last_name) AS member_name,
      br.staff_id,
      CASE WHEN s.staff_id IS NULL THEN NULL ELSE CONCAT(s.first_name, ' ', s.last_name) END AS staff_name,
      sb.branch_name AS staff_branch
    FROM borrowing br
    JOIN book b ON br.book_id = b.book_id
    JOIN member m ON br.member_id = m.member_id
    LEFT JOIN staff s ON br.staff_id = s.staff_id
    LEFT JOIN branch sb ON s.branch_id = sb.branch_id
    ${where}
    ORDER BY br.borrowed_at DESC;
  `;

  const { rows, error } = await query<BorrowingRow[]>(sql);

  if (error || !rows) {
    const fallback: BorrowingRow[] = [
      {
        borrowing_id: 1,
        book_id: 1,
      member_id: 1,
      borrowed_at: new Date().toISOString(),
      due_date: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      return_date: null,
      title: "Sample Book",
      member_name: "Member One",
      staff_id: null,
      staff_name: null,
      staff_branch: null,
    } as BorrowingRow,
  ];
    return NextResponse.json(
      { success: true, borrowings: fallback, warning: "Using fallback borrowings due to database timeout" },
      { status: 200 }
    );
  }

  return NextResponse.json({ success: true, borrowings: rows });
}

//
// ========================================================
// PUT /api/borrowings → mark returned (body: borrowing_id)
// ========================================================
export async function PUT(req: Request) {
  const body = await req.json();
  const rawId = body.borrowing_id;
  const borrowing_id = Number(rawId);
  if (!borrowing_id || Number.isNaN(borrowing_id)) {
    return NextResponse.json(
      { success: false, error: "Invalid borrowing_id" },
      { status: 400 }
    );
  }

  const sql = `
    UPDATE borrowing
    SET return_date = NOW()
    WHERE borrowing_id = ?;
  `;

  const { rows, error } = await query<ResultSetHeader>(sql, [borrowing_id]);
  if (error || !rows) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update borrowing" },
      { status: 500 }
    );
  }
  if (rows.affectedRows === 0) {
    return NextResponse.json(
      { success: false, error: "Borrowing not found" },
      { status: 404 }
    );
  }

  // set book available (best-effort)
  await query<ResultSetHeader>(
    `UPDATE book SET book_status = 'available' WHERE book_id = (SELECT book_id FROM borrowing WHERE borrowing_id = ?);`,
    [borrowing_id]
  ).catch(() => {});

  return NextResponse.json({ success: true, updated: rows.affectedRows });
}
