import { query } from "@/lib/sql";
import { NextResponse } from "next/server";

type MemberRow = {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  member_status: string;
};

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
  }

  const sql = `
    SELECT
      m.member_id,
      m.first_name,
      m.last_name,
      m.email,
      m.password,
      mm.member_status
    FROM member m
    JOIN memberMembership mm ON m.member_id = mm.member_id
    WHERE m.email = ?
    LIMIT 1;
  `;

  const { rows, error } = await query<MemberRow[]>(sql, [email]);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const user = rows?.[0];
  if (!user || user.password !== password) {
    return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
  }

  const sessionPayload = {
    member_id: user.member_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    status: user.member_status,
  };

  const encoded = Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

  const res = NextResponse.json({ success: true, member: sessionPayload });
  res.cookies.set("member_session", encoded, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  res.cookies.set("member_public", encoded, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  res.cookies.set("admin_session", "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
