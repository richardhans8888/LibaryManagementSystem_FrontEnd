import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

interface BorrowingHistory extends RowDataPacket {
  member_id: number;
  title: string;
  borrowed_at: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number | null;
  borrowing_status: string;
}

const extractMemberId = (
  params: { member_borrowing?: string | string[] } | undefined,
  url?: string
) => {
  const raw =
    params && "member_borrowing" in params
      ? Array.isArray(params.member_borrowing)
        ? params.member_borrowing[0]
        : params.member_borrowing
      : undefined;

  const fromParams = raw !== undefined ? Number.parseInt(raw, 10) : NaN;
  if (!Number.isNaN(fromParams)) return fromParams;

  if (url) {
    const tail = url.split("/").filter(Boolean).pop() ?? "";
    const fromUrl = Number.parseInt(tail, 10);
    if (!Number.isNaN(fromUrl)) return fromUrl;
  }

  return null;
};

//
// ========================================================
// GET /api/member/borrowing/[member_borrowing] → current borrowings
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { member_borrowing: string | string[] } }
) {
  const memberId = extractMemberId(params, req.url);

  if (memberId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid member id (history borrowing)" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      am.member_id,
      b.title,
      br.borrowed_at,
      br.due_date,
      br.return_date,
      br.fine_amount,
      CASE
        WHEN br.return_date IS NULL AND br.due_date < CURRENT_DATE
          THEN 'Overdue'
        WHEN br.return_date IS NULL
          THEN 'Currently Borrowed'
        ELSE 'Returned'
      END AS borrowing_status
    FROM borrowing br
    JOIN activeMembers am ON br.member_id = am.member_id
    JOIN book b ON br.book_id = b.book_id
    WHERE br.member_id = ?
      AND br.return_date IS NULL
    ORDER BY br.borrowed_at DESC;
  `;

  const { rows, error } = await query<BorrowingHistory[]>(sql, [memberId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load borrowings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, history_borrows: rows });
}
