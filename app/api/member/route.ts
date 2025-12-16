import { query } from "@/lib/sql";
import { NextResponse } from "next/server";
import type { MemberRow } from "@/types/db";
import type { ResultSetHeader } from "mysql2";

//
// ========================================================
// GET /api/member → list active and blacklist members
// ========================================================
export async function GET() {
  const sql = `
    SELECT
      mm.membership_id,
      m.member_id,
      m.first_name,
      m.last_name,
      m.address,
      m.phone_number,
      m.email,
      m.password,
      mm.membership_start_date,
      mm.membership_end_date,
      bm.blacklisted_at
    FROM member m
    JOIN memberMembership mm ON m.member_id = mm.member_id
    LEFT JOIN blacklistedMembers bm ON bm.member_id = m.member_id
    ORDER BY m.last_name;
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

//
// ========================================================
// POST /api/member → add a member (member + membership row) - legacy admin support
// ========================================================
export async function POST(req: Request) {
  const body = await req.json();
  const {
    first_name,
    last_name,
    address,
    phone_number,
    email,
    password,
    membership_start_date,
    membership_end_date,
  } = body;

  if (!first_name || !last_name || !membership_start_date || !password) {
    return NextResponse.json(
      { success: false, error: "Missing required member fields" },
      { status: 400 }
    );
  }

  const insertMemberSql = `
    INSERT INTO member (
      first_name,
      last_name,
      address,
      phone_number,
      email,
      password
    )
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  const { rows: memberRows, error: memberError } = await query<ResultSetHeader>(insertMemberSql, [
    first_name,
    last_name,
    address ?? null,
    phone_number ?? null,
    email ?? null,
    password,
  ]);

  if (memberError) {
    return NextResponse.json(
      { success: false, error: memberError.message },
      { status: 500 }
    );
  }

  if (!memberRows || memberRows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add member" },
      { status: 500 }
    );
  }

  const member_id = memberRows.insertId;

  const insertMembershipSql = `
    INSERT INTO memberMembership (
      member_id,
      membership_start_date,
      membership_end_date
    )
    VALUES (?, ?, ?);
  `;

  const { rows: membershipRows, error: membershipError } = await query<ResultSetHeader>(insertMembershipSql, [
    member_id,
    membership_start_date,
    membership_end_date ?? null,
  ]);

  if (membershipError) {
    return NextResponse.json(
      { success: false, error: membershipError.message },
      { status: 500 }
    );
  }

  if (!membershipRows || membershipRows.affectedRows !== 1) {
    return NextResponse.json(
      { success: false, error: "Failed to add membership" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    member_id,
  });
}
