import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

interface LateFeeRow extends RowDataPacket {
  member_id: number;
  title: string;
  days_late: number;
  fine_amount: number;
  payment_status: string | null;
}

const extractMemberId = (
  params: { member_late_fee?: string | string[] } | undefined,
  url?: string
) => {
  const raw =
    params && "member_late_fee" in params
      ? Array.isArray(params.member_late_fee)
        ? params.member_late_fee[0]
        : params.member_late_fee
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
// GET /api/member/late_fee/[member_late_fee] → member late fees
// ========================================================
export async function GET(
  req: Request,
  { params }: { params: { member_late_fee: string | string[] } }
) {
  const memberId = extractMemberId(params, req.url);

  if (memberId === null) {
    return NextResponse.json(
      { success: false, error: "Invalid member id (late fee)" },
      { status: 400 }
    );
  }

  const sql = `
    SELECT
      br.member_id,
      b.title,
      CASE
        WHEN br.return_date IS NULL AND CURRENT_DATE > br.due_date
          THEN DATEDIFF(CURRENT_DATE, br.due_date)
        ELSE 0
      END AS days_late,
      CASE
        WHEN CURRENT_DATE > br.due_date
          THEN DATEDIFF(CURRENT_DATE, br.due_date) * 50000
        ELSE 0
      END AS fine_amount,
      CASE
        WHEN br.borrowing_status = 'Overdue'
          THEN 'Unpaid'
        ELSE 'Paid'
      END AS payment_status
    FROM borrowing br
    JOIN activeMembers am ON br.member_id = am.member_id
    JOIN book b ON br.book_id = b.book_id
    WHERE br.borrowing_status = 'Overdue'
      AND br.member_id = ?;
  `;

  const { rows, error } = await query<LateFeeRow[]>(sql, [memberId]);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load late fees" },
      { status: 500 }
    );
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { success: false, error: "No overdue borrowings found for this member" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, member_late_fees: rows });
}
