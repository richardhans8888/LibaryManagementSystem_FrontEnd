import { NextResponse } from "next/server";
import { query } from "@/lib/sql";
import type { RowDataPacket } from "mysql2";

type PaymentRow = RowDataPacket & {
  payment_id: number;
  membership_id: number;
  total_month: number;
  total_cost: number | null;
  member_name: string | null;
  membership_start_date: string | null;
  membership_end_date: string | null;
  blacklisted_at: string | null;
};

//
// GET /api/payment → list all membership payments
//
export async function GET() {
  const sql = `
    SELECT
      mp.payment_id,
      mp.membership_id,
      mp.total_month,
      pf.total_cost,
      CONCAT(m.first_name, ' ', m.last_name) AS member_name,
      mm.membership_start_date,
      mm.membership_end_date,
      bm.blacklisted_at
    FROM memberPayment mp
    LEFT JOIN memberMembership mm ON mp.membership_id = mm.membership_id
    LEFT JOIN member m ON mm.member_id = m.member_id
    LEFT JOIN packageFee pf ON mp.total_month = pf.total_month
    LEFT JOIN blacklistedMembers bm ON bm.member_id = m.member_id
    ORDER BY mp.payment_id DESC;
  `;

  const { rows, error } = await query<PaymentRow[]>(sql);

  if (error || !rows) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load payments" },
      { status: 500 }
    );
  }

  const normalized = rows.map((p) => ({
    payment_id: p.payment_id,
    membership_id: p.membership_id,
    total_month: Number(p.total_month),
    total_cost: p.total_cost !== null ? Number(p.total_cost) : null,
    member_name: p.member_name,
    membership_start_date: p.membership_start_date,
    membership_end_date: p.membership_end_date,
    blacklisted_at: p.blacklisted_at,
  }));

  return NextResponse.json({ success: true, payments: normalized });
}
