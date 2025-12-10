import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { MemberRow } from "@/types/db";

//
// ========================================================
// GET /api/member → list active and suspended members
// ========================================================
export async function GET() {
  const sql = `
    SELECT
      member_id,
      first_name,
      last_name,
      phone_number,
      email,
      membership_start_date,
      membership_end_date,
      member_status
    FROM activeMembers
    WHERE member_status IN ('active', 'suspended')
    ORDER BY member_status DESC, last_name;
  `;

  const { rows, error } = await query<MemberRow[]>(sql);

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  if (!rows) {
    return NextResponse.json(
      { success: false, error: "Failed to load members" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, members: rows });
}
