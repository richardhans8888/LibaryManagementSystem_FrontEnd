import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/sql";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

const parseSession = async () => {
  const store = cookies();
  const raw = (await store).get("member_session")?.value;
  if (!raw) return null;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(decoded) as { member_id: number };
  } catch {
    return null;
  }
};

//
// GET /api/member/profile → current member profile
//
export async function GET() {
  const session = await parseSession();
  if (!session?.member_id) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const { rows, error } = await query<RowDataPacket[]>(
    `
    SELECT
      m.member_id,
      m.first_name,
      m.last_name,
      m.address,
      m.phone_number,
      m.email
    FROM member m
    WHERE m.member_id = ?
    LIMIT 1;
    `,
    [session.member_id]
  );

  if (error || !rows || rows.length === 0) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, profile: rows[0] });
}

//
// PUT /api/member/profile → update current member profile (password optional, requires old_password when set)
//
export async function PUT(req: Request) {
  const session = await parseSession();
  if (!session?.member_id) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { first_name, last_name, address, phone_number, email, password, old_password } = body;

  if (
    first_name === undefined &&
    last_name === undefined &&
    address === undefined &&
    phone_number === undefined &&
    email === undefined &&
    password === undefined
  ) {
    return NextResponse.json(
      { success: false, error: "Nothing to update" },
      { status: 400 }
    );
  }

  if (password && !old_password) {
    return NextResponse.json(
      { success: false, error: "Current password is required to set a new password" },
      { status: 400 }
    );
  }

  // check current password if changing
  if (password) {
    const { rows, error } = await query<RowDataPacket[]>(
      `SELECT password FROM member WHERE member_id = ? LIMIT 1;`,
      [session.member_id]
    );
    if (error || !rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to verify password" },
        { status: 500 }
      );
    }
    const current = rows[0].password as string | null;
    if (current !== old_password) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }
  }

  // unique email check when changing
  if (email) {
    const { rows, error } = await query<RowDataPacket[]>(
      `SELECT member_id FROM member WHERE email = ? AND member_id <> ? LIMIT 1;`,
      [email, session.member_id]
    );
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    if (rows && rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already in use" },
        { status: 400 }
      );
    }
  }

  const { rows, error } = await query<ResultSetHeader>(
    `
    UPDATE member
    SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      address = COALESCE(?, address),
      phone_number = COALESCE(?, phone_number),
      email = COALESCE(?, email),
      password = COALESCE(?, password)
    WHERE member_id = ?;
    `,
    [
      first_name ?? null,
      last_name ?? null,
      address ?? null,
      phone_number ?? null,
      email ?? null,
      password ?? null,
      session.member_id,
    ]
  );

  if (error || !rows) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, updated: rows.affectedRows });
}
